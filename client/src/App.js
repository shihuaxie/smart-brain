import React, {useState} from 'react'
import ParticlesBg from 'particles-bg'
import Navigation from './components/Navigation/Navigation'
import SignIn from "./components/SignIn/SignIn";
import Register from './components/Register/Register'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import './App.css';
import axios from "axios";

axios.defaults.baseURL = 'sylvia-smart-brain.netlify.app';
axios.defaults.withCredentials = true;
// const app = new Clarifai.App({
//     apiKey: 'your key'
// });


const App = () => {
    const [input, setInput] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [box, setBox] = useState({});
    const [route, setRoute] = useState('register');
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState({
        id: '',
        name: '',
        email: '',
        joined: ''
    });

    const loadUser = (data) => {
        setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            joined: data.joined
        });
    };

    const calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - clarifaiFace.right_col * width,
            bottomRow: height - clarifaiFace.bottom_row * height
        };
    };

    const displayFaceBox = (x) => {
        setBox(x);
    };

    const onInputChange = (event) => {
        setInput(event.target.value);
    };

    const onButtonSubmit = () => {
        setImageUrl(input);

        const USER_ID = 'hkdsyblxuvc7';
        const PAT = 'bc8dfdbc52fe4bc0b8b40e0c50ff47ba';
        const APP_ID = 'my-first-application';
        const MODEL_ID = 'face-detection';
        const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
        const IMAGE_URL = input;

        const raw = JSON.stringify({
            user_app_id: {
                user_id: USER_ID,
                app_id: APP_ID
            },
            inputs: [
                {
                    data: {
                        image: {
                            url: input
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

        fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result) {
                    fetch('https://evening-meadow-96869.herokuapp.com/image', {
                        method: 'put',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: user.id
                        })
                    })
                        .then(result => result.json())
                        // .then(count => {
                        //     setUser(prevUser => ({ ...prevUser, entries: count }));
                        // })
                        .catch(console.log);
                }
                displayFaceBox(calculateFaceLocation(result));
            })
            .catch(error => console.log('error', error));
    };

    const onRouteChange = (route) => {
        if (route === 'signout') {
            setUser({
                id: '',
                name: '',
                email: '',
                joined: ''
            });
        } else if (route === 'home') {
            setIsSignedIn(true);
        }
        setRoute(route);
    };


    return (
        <div className='App'>
            <ParticlesBg className='particles' num={150} type="cobweb" bg={true} />
            <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
            {route === 'home' ? (
                <div>
                    <Logo />
                    <Rank name={user.name}  />
                    <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
                    <FaceRecognition imageUrl={imageUrl} box={box} />
                </div>
            ) : route === 'signin' ? (
                <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
            ) : (
                <Register loadUser={loadUser} onRouteChange={onRouteChange} />
            )}
        </div>
    );
};

export default App;
