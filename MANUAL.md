# サーバーサイドエンジニアがゼロから始めるフロントエンド開発

## はじめに

昨今のフロントエンド開発は様々なツールが乱立しており、Node.jsを使用してCLIで環境を用意するところから結構な知識を必要とするため、学習コストが高くなってきているように感じています。
自分もなかなか食指が動かなかったのですが、勉強がてらフロントエンドの開発を行う環境を構築する手順をまとめてみました。

すごく長いです。

## 準備

開発用のVM環境を用意してください。

* vagrant（centos前提）

## 利用するパッケージ

あえて利用したことのない新しめのツールを選定しています。
別言語に依存するパッケージを使いたくなかったので、今回はすべてnode.jsの処理系で揃えています。

### node.js

 * V8エンジンで動作するサーバーサイドjavascript実行環境

### npm

 * node.jsのパッケージ管理ツール
 * 設定ファイルは`package.json`
 * 以下のツール群はnpmでインストールする

### gulp

 * gruntと双璧を成すタスクランナー
 * 設定ファイルは`gulpfile.js`
 * 後述のjspmやstylusはgulp経由でビルド処理に組み込む
 * gruntは使ったことあるのでglupも使ってみる

### jspm
 * ライブラリの管理もできるモジュールロード時の依存解決系ツール
 * requirejsとbowerを合わせたようなもの
 * 設定ファイルはJSライブラリ設定が`package.json`に、jspmの設定は`config.js`に
 * webpackと迷ったがこちらに興味が湧いたので使ってみる

### stylus
 * CSSを書きやすくしてくれるCSSメタ言語
 * 類似ツールはlessとかsass
 * sassにcompassというライブラリがあるようにstylusにもkouto swissもしくはnibというライブラリがある
 * いろいろ省略して柔軟に書けるがチーム開発の場合はルール決めが必要
 * sassは処理系がrubyなのでnode.jsで動くstylusを使ってみる

### Babel

 * jspmでES6→ES5に変換するトランスパイラの設定が可能なのでBabelを使ってみる
 * ES6で開発してみるチャレンジ

## アプリ開発用のライブラリ

上記のjspmでインストール・管理します。

### jQuery

 * `$`という変数に入れて使われる便利なやつ
 * Backboneがイベントリスナのdelegate登録やajax通信に使ってる

### Underscore.js

 * `_`という変数に入れて使われる便利なやつ
* 一部の機能はjQueryとかぶってる
* 開発者はBackboneと同じ人
* 機能拡張したlodashというのもある（上記のパッケージ群が使ってるぽい）

### Backbone.js

 * 比較的計量なMVCフレームワーク
 * jQueryとUnderscore.jsに依存している
 * 使ったことある（他のフレームワークはまたの機会に）

こうしてみるとツールの選定に迷いますね。gulpにしてもgruntにしても必要となるサブパッケージが沢山あるので、このあたりが取っ付きづらさを醸し出しています。

## 環境構築

各種パッケージのインストールを行います。基本的にCLIで構築するので、vagrantを起動してsshでログインしてください。

### プロジェクトルートを作成

名前は適当です。

```
$ mkdir ~/devfront; cd $_
```

## node.jsのインストール

ここではyumでインストールします。

```
$ sudo yum -y install nodejs npm
$ node -v
v0.10.36
$ npm -v
1.3.6
```

## プロジェクトの設定

```
$ npm init
```

対話式なので答えていくと`package.json`が作成されます。

```
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sane defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg> --save` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
name: (devfront)
version: (0.0.0)
description:
entry point: (index.js)
test command:
git repository:
keywords:
author:
license: (BSD)
About to write to /home/vagrant/devfront/package.json:

{
  "name": "devfront",
  "version": "0.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "BSD"
}


Is this ok? (yes)
```

publicなリポジトリで公開するための設定が多いので、privateなプロジェクトでは必要のない項目もあります。
ひとまずそのままエンター連打でデフォルトの設定にしました。後々必要になったら修正しましょう。

## パッケージをインストール

`-g`オプションをつけるとグローバルインストールとなり、`-g`がなければカレントディレクトリに`node_modules`というディレクトリが作成され、その中にインストールされます。グローバルインストールしておくとCLIツールのPATHが通ります。
```
$ sudo npm install -g gulp jspm stylus
```

オプションに`--save-dev`を付けるとインストールしたパッケージ情報が`package.json`に保存され、`npm install`コマンドを実行することで同一のパッケージをインストールすることが可能になります。
グローバルでインストールしたパッケージも`--save-dev`を付けてローカルにインストールします。
```
$ npm install gulp jspm gulp-jspm stylus nib gulp-stylus --save-dev
$ npm install gulp-load-plugins gulp-plumber gulp-if gulp-foreach --save-dev
$ npm install gulp.spritesmith gulp-imagemin gulp-uglify gulp-ejs gulp-notify --save-dev
```

glupで使われるパッケージを紹介しておきます。

| package           | 説明          |
| ----------------- | ------------- |
| gulp              | gulp本体      |
| gulp-load-plugins | package.jsonに書いてあるgulp-*系のパッケージをまとめてrequireできる |
| gulp-plumber　    | エラー時にgulpが終了しないようにする。watchしてる時に起動しなおさなくてよい |
| gulp-if           | gulpのタスクの処理で、条件指定でいろいろできるようになる |
| gulp-foreach      | gulpのタスクの処理で、ファイル名のループをしたいときに使う |
| gulp.spritesmith  | CSSスプライト |
| gulp-imagemin     | 画像の軽量化  |
| gulp-uglify       | JSの軽量化    |
| gulp-ejs          | gulp内でテンプレートを利用できる |
| gulp-notify       | エラー時に通することができる |

これででインストール作業は終了です。全てのパッケージのインストールには結構な時間がかかると思います。

## フロントアプリ用のライブラリをインストール

まずjspmの設定を行います。

```
$ jspm init
Would you like jspm to prefix the jspm package.json properties under jspm? [yes]:
Enter server baseURL (public folder path) [./]:
Enter jspm packages folder [./jspm_packages]:
Enter config file path [./config.js]:
Configuration file config.js doesn't exist, create it? [yes]:
Enter client baseURL (public folder URL) [/]:
Do you wish to use a transpiler? [yes]:
Which ES6 transpiler would you like to use, Babel, TypeScript or Traceur? [babel]:
```

続いてアプリ開発に必要なモジュールをインストールします。

```
$ jspm install jquery
$ jspm install underscore
$ jspm install backbone
```

`package.json`と`config.js`にjspmの設定が追加されます。
これ以降は`npm install`同様に設定ファイルからバージョンを指定してインストールすることが可能になります。

```
$ jspm install
```

動かしてみる

JS
```js
import $ from 'jquery';
import _ from 'underscore';

console.log("jQuery version: " + $.fn.jquery);
console.log("underscore version: " + _.VERSION);
```

index.html
```html
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <h1>Hello jspm world.</h1>
    <section class="content js-content"></section>
    <script src="/src/js/vendor/system.js"></script>
    <script src="/src/js/config.js"></script>
    <script>System.import('/src/js/app');</script>
  </body>
</html>
```

これを商用環境用にビルドする時は`bundle-sfx`コマンドを使います。
```
$ jspm bundle-sfx --skip-source-maps --minify app js/app.js
```

ソースマップを利用する場合は`--skip-source-maps`を外したほうがいいでしょう。

この場合、HTMLはJSファイルを1つだけ読みこむことで自動的にスクリプトが開始されます。

```
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <h1>Hello jspm world.</h1>
    <section class="content js-content"></section>
    <script src="/dst/js/app.js"></script>
  </body>
</html>
```

まだ途中です。
