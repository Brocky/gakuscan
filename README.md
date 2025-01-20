[![Discord](https://img.shields.io/discord/1327359399811092552?logo=discord&logoColor=%23fff&label=Discord&labelColor=%235865F2)](https://discord.com/invite/mDumA87rph)
# GakuScan(学スキャン)
[![GakuScan Logo](assets/logo-banner.png)](https://gakuscan.app)

Immersion is one of the most effective ways to learn a language. GakuScan empowers you to dive into authentic Japanese content without getting overwhelmed. By providing instant support for text recognition and grammar, it helps you focus on enjoying the material while steadily building your skills.

Perfect for gamers, manga enthusiasts, and anyone exploring the Japanese language, GakuScan turns your favorite activities into opportunities to learn and grow.

Start your immersion journey today with GakuScan because learning Japanese should be as fun as it is rewarding!

## Key Features:
 - **Real-Time OCR:** Capture Japanese text directly from your screen -be it a game, manga, or website- and convert it instantly.
 - **Grammar Highlights:** Automatically identifies and highlights grammatical structures to help you understand sentence patterns at a glance.
 - **Seamless Integration:** Works with split screens, shared windows, or fullscreen apps, so you never have to interrupt your experience.
 - **Versatile Text Usage**: Use the output with tools like [YomiTan]((https://yomitan.wiki/)) or copy it to other applications.

## How to use
Just navigate to [gakuscan.app](https://gakuscan.app) and follow the instructions.  
To get started with GakuScan, you need to configure the app by entering a **Google Cloud Vision API Key** in the settings. This is required to enable text extraction functionality. If you're new to the app, we recommend reviewing the [Why You Need a Google Cloud Vision API Key](./docs/google-vision.md) guide to understand its importance and how to obtain one. Once set up, refer to the [Usage Guide](./docs/usage.md) for detailed instructions on using GakuScan to capture and extract text effectively.

Thank you for using GakuScan!

## Get involved
Have **feedback**, **questions**, or **ideas** to improve GakuScan?  
Join our official [Discord server](https://discord.com/invite/mDumA87rph) to connect with the community, get support, and stay updated on the latest features and developments.

## Installation
If you want to use a local copy, install the dependencies as with any other node application.
```bash
npm install
```
GakuScan is developed with a [minimalistic approach](./docs/design-philosophy.md#minimalism-first) and therefore only has a handfull of dependencies. It don't even need it's own backend infrastructure. All you need to do is serve the application files like any static web page. If you don't know how to do that, you can simply run the following command.
```bash
npm run serve
```