"""Watch the native main deployment; recover transient Vercel Git failures."""
import json
import os
import time
import urllib.request


def ensure(sha, github, trigger, sleep=time.sleep, log=print, polls=12):
    baseline = 0
    for attempt in range(3):
        for _ in range(polls):
            if github('commits/main')['sha'] != sha:
                log('A newer main commit superseded this deployment.')
                return
            statuses = github(f'commits/{sha}/statuses')
            latest = next((s for s in statuses if s['context'] == 'Vercel' and s['id'] > baseline), None)
            if latest and latest['state'] == 'success':
                log(f'Production deployment succeeded for {sha}.')
                return
            if latest and latest['state'] in ('failure', 'error'):
                break
            sleep(30)
        if attempt == 2:
            raise RuntimeError('Vercel did not succeed after the native deployment and two recovery attempts.')
        # Do not recover an obsolete commit or mistake a previous result for this retry.
        if github('commits/main')['sha'] != sha:
            log('A newer main commit superseded this deployment.')
            return
        baseline = max((s['id'] for s in github(f'commits/{sha}/statuses') if s['context'] == 'Vercel'), default=0)
        trigger()
        log(f'Requested automatic main recovery {attempt + 1}/2.')


def main():
    repository = os.environ['GITHUB_REPOSITORY']
    token = os.environ['GH_TOKEN']
    hook = os.environ['VERCEL_MAIN_DEPLOY_HOOK']

    def github(path):
        request = urllib.request.Request(f'https://api.github.com/repos/{repository}/{path}', headers={
            'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        })
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)

    def trigger():
        if not hook.startswith('https://api.vercel.com/v1/integrations/deploy/'):
            raise RuntimeError('The main-only Vercel recovery hook is missing or invalid.')
        # Never print the hook: its URL authorizes deployments of this project branch.
        request = urllib.request.Request(hook, data=b'', method='POST')
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                json.load(response)
        except Exception:
            raise RuntimeError('Vercel rejected the recovery request.') from None

    ensure(os.environ['GITHUB_SHA'], github, trigger)


if __name__ == '__main__':
    main()
