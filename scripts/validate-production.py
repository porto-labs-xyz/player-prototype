import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('production', Path(__file__).with_name('ensure-production.py'))
production = importlib.util.module_from_spec(spec)
spec.loader.exec_module(production)

class RecoveryTests(unittest.TestCase):
    def run_case(self, head='current', mode='success'):
        calls = []
        def github(path):
            if path == 'commits/main': return {'sha': head}
            if mode == 'pending': return []
            return [{'id': 1 + len(calls), 'context': 'Vercel', 'state':
                     'success' if mode == 'success' or (mode == 'recover' and calls) else 'failure'}]
        production.ensure('current', github, lambda: calls.append('trigger'), sleep=lambda _: None, log=lambda _: None, polls=2)
        return calls
    def test_success_never_redeploys(self): self.assertEqual(self.run_case(), [])
    def test_failure_recovers(self): self.assertEqual(self.run_case(mode='recover'), ['trigger'])
    def test_obsolete_commit_never_redeploys(self): self.assertEqual(self.run_case(head='new'), [])
    def test_repeated_failure_is_bounded(self):
        with self.assertRaises(RuntimeError): self.run_case(mode='failure')
    def test_missing_status_is_bounded(self):
        with self.assertRaises(RuntimeError): self.run_case(mode='pending')
    def test_old_success_is_not_a_recovery_success(self):
        triggered=[]
        def github(path):
            if path=='commits/main': return {'sha':'current'}
            return [{'id':2,'context':'Vercel','state':'failure'},{'id':1,'context':'Vercel','state':'success'}]
        with self.assertRaises(RuntimeError):
            production.ensure('current',github,lambda:triggered.append(1),sleep=lambda _:None,log=lambda _:None,polls=2)
        self.assertEqual(len(triggered),2)
    def test_live_revision_succeeds_without_provider_status(self):
        def github(path):
            if path == 'commits/main': return {'sha':'current'}
            self.fail('No status needed when production proves its revision')
        production.ensure('current',github,lambda:self.fail('No retry needed'),deployed=lambda:'current')
    def test_old_live_revision_does_not_pass(self):
        def github(path):
            return {'sha':'current'} if path == 'commits/main' else []
        with self.assertRaises(RuntimeError):
            production.ensure('current',github,lambda:None,deployed=lambda:'old',sleep=lambda _:None,log=lambda _:None,polls=1)

unittest.main()
