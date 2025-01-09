# GakuScan(学スキャン)
![GakuScan Logo](assets/logo-simplyfied.svg)

Immersion is one of the most effective ways to learn a language. GakuScan empowers you to dive into authentic Japanese content without getting overwhelmed. By providing instant support for text recognition and grammar, it helps you focus on enjoying the material while steadily building your skills.

Perfect for gamers, manga enthusiasts, and anyone exploring the Japanese language, GakuScan turns your favorite activities into opportunities to learn and grow.

Start your immersion journey today with GakuScan—because learning Japanese should be as fun as it is rewarding!

## Key Features:
 - **Real-Time OCR:** Capture Japanese text directly from your screen—be it a game, manga, or website—and convert it instantly.
 - **Grammar Highlights:** Automatically identifies and highlights grammatical structures to help you understand sentence patterns at a glance.
 - **Seamless Integration:** Works with split screens, shared windows, or fullscreen apps, so you never have to interrupt your experience.

## Setup
Install the dependencies as with any other node application.
```bash
npm install
```
GakuScan is developed with a minimalistic approach and therefore only has a handfull of dependencies. It don't even need it's own backend infrastructure. All you need to do is serve the application files like any static web page. If you don't know how to do that, you can simply run the following command.
```bash
npm run serve
```

## How to use
### First Time Use
For OCR GakuScan uses google's [Cloud Vision API](https://cloud.google.com/).
Therefore it is necessary to sign up with google cloud, activate the vision api and get an api-key.
When you first use GakuScan, go into the `settings` and enter your api-key.
The key will then be stored in your browser's local storage.
### Sharing Tabs, Windows or Screens
By clicking on the area with the large capture icon, the browser will ask you to select a Tab, Window or Screen to share. This might be an online Manga Reader, a japanese website or a Videogame. GakuScan works best when used on a second monitor. Once you slected your target, you need to come back to GakuScan and will see your screen mirrored here. You may now select an area to be scanned.