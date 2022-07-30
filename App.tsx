/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState } from 'react';
import { Image, PermissionsAndroid, ScrollView, Text, TextInput, TouchableNativeFeedback, View } from 'react-native';

//import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
//import RNTextDetector from "rn-text-detector";
import TextRecognition from 'react-native-text-recognition';
import EStyleSheet from 'react-native-extended-stylesheet';

import { useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import { HelperText, Portal, Modal, Provider as PaperProvider } from 'react-native-paper';
import { RadioButton } from 'react-native-paper';
import { ApolloProvider } from '@apollo/client';

import { apolloClient } from './src/api/client';

import FlashMessage from 'react-native-flash-message';
import Home from './src/components/views/Home';

EStyleSheet.build({
  // always call EStyleSheet.build() even if you don't use global variables!
  $textColor: '#0275d8',
});

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <PaperProvider>
        <Home />
      </PaperProvider>
    </ApolloProvider>
  );
};

export default App;
