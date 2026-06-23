# NPV & IRR 계산기

브라우저에서 `index.html`을 열면 동작합니다. 초기투자, 각 기간의 현금흐름, 할인율을 입력하고 `계산`을 누르면 NPV와 IRR을 계산합니다.

배포 (GitHub Pages)
 - 새로운 GitHub 저장소를 만들고 원격을 추가한 뒤 `main` 브랜치로 푸시하면 GitHub Actions가 자동으로 `gh-pages` 브랜치로 배포합니다.
 - 예시 명령 (아래에서 `USERNAME`과 `REPO`를 본인 계정/저장소명으로 바꿔 실행):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

- 푸시 후 GitHub Actions가 실행되어 `gh-pages` 브랜치로 사이트를 배포합니다. 배포된 사이트 URL은 `https://USERNAME.github.io/REPO/` 입니다.
- 참고: 퍼블리시 디렉터리를 루트(`./`)로 설정했으므로 `index.html`이 저장소 루트에 있어야 합니다.

