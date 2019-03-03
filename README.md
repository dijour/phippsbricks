This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Phipps Bricks

This web-application was developed by a Carnegie Mellon University 67-373 team in an effort to standardize and accurize the inscriptions of over 6000 bricks donated to Phipps Conservatory. When we were first brought on to tackle the project as part of the Information Systems Course, we were faced with a data-set riddled with inconsistency. Before discussing any specific technical solutions, it was clear that whatever solution we implemented, the technology would need to quickly and efficiently create a new, accurate data set, which is easily accessible for visitors who want to know where their bricks are laid. 

Thus, the 67-373 team created two solutions to this problem. First, we created a logging tool to enable Phipps employees and volunteers to quickly and accurately log the 6,000+ bricks with their GPS coordinates. Second, we created a front-facing tool for visitors which used the informatoin gathered in step 1 to display these bricks, and their locations. 

To accomplish this simple, but effective implementation, the backbone of this web-application is structured on top of Firebase's [Firestore](https://firebase.google.com/docs/firestore/), a real time NoSQL database with lightning fast search capability and real-time updates. We also tacked [Algolia's Full-Text search](https://www.algolia.com/) capabilities onto Firestore, to enable faster and more lenient querying of the data, so search strings would not have to be matched strictly to the information in the database. The GPS information can be logged and displayed using onClick listeners in a [Google- Map-React NPM](https://github.com/google-map-react/google-map-react) package, which uses API keys from [Google Cloud Console](https://console.cloud.google.com/) to display coordinates. Finally, this solution was deployed using the [Mars React/Heroku build-pack](https://github.com/mars/create-react-app-buildpack), which quickly builds React JS code and deploys it to Heroku.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
