## .gitの構造

`.git`ディレクトリの構造は次のドキュメントで説明されている。

https://git-scm.com/docs/gitrepository-layout

```
.git
├── HEAD
├── config
├── description
├── hooks
│   ├── applypatch-msg.sample
│   ├── commit-msg.sample
│   ├── fsmonitor-watchman.sample
│   ├── post-update.sample
│   ├── pre-applypatch.sample
│   ├── pre-commit.sample
│   ├── pre-merge-commit.sample
│   ├── pre-push.sample
│   ├── pre-rebase.sample
│   ├── pre-receive.sample
│   ├── prepare-commit-msg.sample
│   ├── push-to-checkout.sample
│   ├── sendemail-validate.sample
│   └── update.sample
├── index
├── info
│   └── exclude
├── logs
│   ├── HEAD
│   └── refs
│       ├── heads
│       │   └── main
│       └── remotes
│           └── origin
│               └── HEAD
├── objects
│   ├── info
│   └── pack
│       ├── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.idx
│       ├── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.pack
│       └── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.rev
├── packed-refs
└── refs
    ├── heads
    │   └── main
    ├── remotes
    │   └── origin
    │       └── HEAD
    └── tags

16 directories, 28 files
```

### `.git/config`

```
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
    <!-- 以下2つはMacbook固有の設定 -->
	ignorecase = true
	precomposeunicode = true
[submodule]
	active = .
[remote "origin"]
	url = ssh://git@github.com/IkumaTadokoro/build-my-own-git.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
	vscode-merge-base = origin/main
	vscode-merge-base = origin/main
```

https://git-scm.com/docs/git-config


### `.git/objects`

```
.git/objects/pack
├── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.idx
├── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.pack
└── pack-dc4f435a8e736b553d2dff24cfbbe66f6fca410c.rev
```

- loose objects が pack になる。
- idx は pack に対するインデックス

### `.git/refs`

```
.git/refs
├── heads
│   └── main
├── remotes
│   └── origin
│       └── HEAD
└── tags
```

`git stash`すると、stashディレクトリも作成される。

```
$ cat .git/refs/heads/main
6da41fdbc05ae5634734ac9e54c76cae06eabb8b
```
