import React, {Component} from 'react'
import ParticlesBg from 'particles-bg'
import Clarifai from 'clarifai'
import Navigation from './components/Navigation/Navigation'
import SignIn from "./components/SignIn/SignIn";
import Register from './components/Register/Register'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import './App.css';


// const app = new Clarifai.App({
//     apiKey: 'your key'
// });

const initialState = {
    input: '', imageUrl: '', box: {}, route: 'home', isSignedIn: false, user: {
        id: '', name: '', email: '', entries: 0, joined: ''
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined
            }
        })
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }

    displayFaceBox = (x) => {
        this.setState({box: x})
    }

    onInputChange = (event) => {
        //console.log(event.target.value) //this will get input value-transfer to child component imagelinkform by props
        this.setState({input: event.target.value})
    }

    onButtonSubmit = () => {
        // console.log('click')
        this.setState({imageUrl: this.state.input});

        const USER_ID = 'hkdsyblxuvc7';
        // Your PAT (Personal Access Token) can be found in the portal under Authentification
        const PAT = 'bc8dfdbc52fe4bc0b8b40e0c50ff47ba';
        const APP_ID = 'my-first-application';
        // Change these to whatever model and image URL you want to use
        const MODEL_ID = 'face-detection';
        const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
        const IMAGE_URL = this.state.inputs;

        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "url": `${this.state.input}`

                        }
                    }
                }
            ]
        });

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key bc8dfdbc52fe4bc0b8b40e0c50ff47ba'
            },
            body: raw
        };

        fetch("https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs", requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result) {
                    fetch(' https://evening-meadow-96869.herokuapp.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(result => result.json())
                        .then(count => {
                            this.setState(Object.assign(this.state.user, { entries: count}))
                        })
                        .catch(console.log)
                }
                this.displayFaceBox(this.calculateFaceLocation(result))
            })
            .catch(error => console.log('error', error));}

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState);
        } else if (route === 'home') {
            this.setState({isSignedIn: true});
        }
        this.setState({route: route});
    }

    render() {
        const {isSignedIn, imageUrl, route, box} = this.state;
        return (<div className='App'>
            <ParticlesBg className='particles' num={150} type="cobweb" bg={true}/>
            <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
            {
                route === 'home' ? <div>
                <Logo/>
                <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
                    />
                <ImageLinkForm
                    onInputChange={this.onInputChange}
                    onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition
                    imageUrl={imageUrl}
                    box={box}
                />
            </div> : (this.state.route === 'signin'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> :
                <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>)
            }
        </div>)
    }
}

export default App;