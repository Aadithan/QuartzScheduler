<h1 align="center">Quartz Scheduler Client</h1>

<div align="center">

A React-based client application for the Quartz Scheduler system.

<a href="https://github.com/facebook/react">
  <img src="https://img.shields.io/badge/react-18.3.1-brightgreen" alt="React">
</a>
<a href="https://github.com/ant-design/ant-design">
  <img src="https://img.shields.io/badge/ant--design-5.20.1-brightgreen" alt="ant-design">
</a>
<a href="https://github.com/microsoft/TypeScript" rel="nofollow">
  <img src="https://img.shields.io/badge/typescript-5.8.3-brightgreen" alt="Typescript">
</a>
<a href="https://github.com/reduxjs/redux" rel="nofollow">
  <img src="https://img.shields.io/badge/@reduxjs/toolkit-2.5.1-brightgreen" alt="Redux">
</a>

</div>

## ✨ Features

- 💡 **TypeScript**: A language for application-scale JavaScript
- 🕒 **Scheduler Management**: Comprehensive job scheduling interface
- 📊 **Dashboard**: Real-time monitoring and analytics
- 💎 **Hooks**: Uses React hooks API for modern development
- 🎯 **Job Management**: Create, edit, and monitor scheduled jobs
- 🚀 **Modern Stack**: Built with React 18, TypeScript, Redux Toolkit, and Ant Design
- 📱 **Responsive**: Optimized for all screen sizes
- 🎨 **Professional UI**: Clean and intuitive user interface with Ant Design
- ⚙️ **Best Practices**: Follows React and TypeScript best practices
- 🔄 **Real-time Updates**: Live status updates for scheduled jobs

## 📦 Install

```bash
# Navigate to the client directory
$ cd src/DNA.ReportScheduler.Client

# npm
$ npm install
$ npm run dev

# yarn
$ yarn install
$ yarn dev
```

## 🔨 Build

```bash
# npm
$ npm install
$ npm run build

# yarn
$ yarn install
$ yarn build
```

## 🚀 Development

Start the development server:

```bash
$ npm run dev
```

The application will be available at `http://localhost:3000`

## 🖥 Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Electron |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                      | last 2 versions                                                                                                                                                                                                   | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                           | last 2 versions                                                                                                                                                                                                       |

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Application header
│   ├── PageTabs.tsx    # Tab navigation
│   └── Sidebar.tsx     # Navigation sidebar
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Dashboard overview
│   ├── Jobs.tsx        # Job management
│   ├── Scheduler.tsx   # Scheduler interface
│   └── Settings.tsx    # Application settings
├── store/              # Redux store configuration
│   ├── index.ts        # Store setup
│   └── slices/         # Redux slices
└── App.tsx             # Main application component
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly before submitting
- Ensure all linting rules pass
