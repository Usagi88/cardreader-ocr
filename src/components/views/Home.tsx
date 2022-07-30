/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useCallback, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  useColorScheme,
  View,
} from 'react-native';

//import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
//import RNTextDetector from "rn-text-detector";
import TextRecognition from 'react-native-text-recognition';
import EStyleSheet from 'react-native-extended-stylesheet';

import {useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

import {HelperText, Portal, Modal, ActivityIndicator} from 'react-native-paper';
import {RadioButton} from 'react-native-paper';

import FlashMessage, {showMessage} from 'react-native-flash-message';
import {useMutation} from '@apollo/client';
import {ADD_CARD} from '../../api/mutations';
import {ReactNativeFile} from 'apollo-upload-client';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Switches from 'react-native-switches';
import {debounce} from 'lodash';

EStyleSheet.build({
  // always call EStyleSheet.build() even if you don't use global variables!
  $textColor: '#0275d8',
});

const App = () => {
  //const isDarkMode = useColorScheme() === 'dark';

  const [imageText, setImageText] = useState<any>([]);
  const [revealNumber, setRevealNumber] = useState<any>(null);
  const [serialNumber, setSerialNumber] = useState<any>(null);
  const [amount, setAmount] = useState<any>(null);

  const [checked, setChecked] = useState<any>(null);
  const [amountChecked, setAmountChecked] = useState<any>(null);

  const [permissions, setPermissions] = useState<any>(null);

  const [newImage, setNewImage] = useState<any>(null);
  const [galleryFlag, setGalleryFlag] = useState<any>(null);
  const [cameraFlag, setCameraFlag] = useState<any>(null);
  const [previewImageFlag, setPreviewImageFlag] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isCardLoading, setIsCardLoading] = useState<any>(false);
  const [darkModeFlag, setDarkModeFlag] = useState<any>(false);

  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  let serialNumberError: any;
  let revealNumberError: any;
  let amountError: any;

  const serialNumberErrors = () => {
    if (checked == 'Ooredoo') {
      if (serialNumber?.length != 11) {
        serialNumberError = 'Ooredoo serial number must contain 11 digits';
        return true;
      } else if (serialNumber?.match(/[^0-9]/g)) {
        serialNumberError = 'Ooredoo serial number must have digits only';
        return true;
      } else if (serialNumber?.length <= 0) {
        serialNumberError = 'Ooredoo serial number requires 11 digits';
        return true;
      }
    } else if (checked == 'Dhiraagu') {
      if (serialNumber?.length != 8) {
        serialNumberError = 'Dhiraagu serial number must contain 8 digits';
        return true;
      } else if (serialNumber?.match(/[^0-9]/g)) {
        serialNumberError = 'Dhiraagu serial number must have digits only';
        return true;
      } else if (serialNumber?.length <= 0) {
        serialNumberError = 'Dhiraagu serial number requires 8 digits';
        return true;
      }
    }
  };

  const revealNumberErrors = () => {
    if (checked == 'Ooredoo') {
      if (revealNumber?.length != 16) {
        revealNumberError = 'Ooredoo reveal number must contain 16 digits';
        return true;
      } else if (revealNumber?.match(/[^0-9]/g)) {
        revealNumberError = 'Ooredoo reveal number must have digits only';
        return true;
      } else if (revealNumber?.length <= 0) {
        revealNumberError = 'Ooredoo reveal number requires 16 digits';
        return true;
      }
    } else if (checked == 'Dhiraagu') {
      if (revealNumber?.length != 16) {
        revealNumberError = 'Dhiraagu reveal number must contain 16 digits';
        return true;
      } else if (revealNumber?.match(/[^0-9]/g)) {
        revealNumberError = 'Dhiraagu reveal number must have digits only';
        return true;
      } else if (revealNumber?.length <= 0) {
        revealNumberError = 'Dhiraagu reveal number requires 16 digits';
        return true;
      }
    }
  };

  const amountErrors = () => {
    if (checked! == 'Ooredoo') {
      if (parseInt(amount!)! <= 0) {
        amountError = 'Requires amount more than 0';
        return true;
      } else if (amount?.match(/[^0-9]/g)) {
        amountError = 'Amount must have digits only';
        return true;
      } else if (!amount!) {
        amountError = 'Enter amount please';
        return true;
      }
    } else if (checked == 'Dhiraagu') {
      if (parseInt(amount!)! <= 0) {
        amountError = 'Requires amount more than 0';
        return true;
      } else if (amount?.match(/[^0-9]/g)) {
        amountError = 'Amount must have digits only';
        return true;
      } else if (!amount!) {
        amountError = 'Enter amount please';
        return true;
      }
    }
  };

  const permission = () => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
    setPermissions(true);
  };

  useEffect(() => {
    permission();
  }, []);

  const pickPhoto = async () => {
    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
        },
        onMediaSelect,
      );
    } catch (e) {
      console.log('error: ' + e);
    } finally {
      setGalleryFlag(true);
    }
  };

  const onMediaSelect = async (media: any) => {
    if (!media.didCancel) {
      console.log(media);
      setNewImage(media);
    }
  };

  useEffect(() => {
    try {
      (async () => {
        if (newImage) {
          let result: any;
          //if picked from gallery
          if (galleryFlag) {
            result = await TextRecognition.recognize(newImage?.assets[0]?.uri);
          } else {
            //picked from camera
            result = await TextRecognition.recognize(newImage?.path);
          }

          if (result?.length > 0) {
            setImageText(result);
            //console.log(result);
            //console.log('length');
            //console.log(result?.length);
            setRevealNumber('');
            setAmount('');
            setSerialNumber('');
            setChecked('');
            setAmountChecked('');
            let ooredoo = result.find((a: any) =>
              a.toLowerCase().includes('ooredoo'),
            );
            let dhiraagu = result.find((a: any) =>
              a.toLowerCase().includes('dhiraagu'),
            );
            let dhiraaguTwo = result.find((a: any) =>
              a.toLowerCase().includes('141'),
            );
            //check brand
            if (ooredoo) {
              setChecked('Ooredoo');
            } else if (dhiraagu) {
              setChecked('Dhiraagu');
            } else if (dhiraaguTwo) {
              setChecked('Dhiraagu');
            }

            if (ooredoo) {
              for (let index = 0; index < result?.length; index++) {
                //checking for ooredoo reveal number
                let ooredooRevealNumber = result[index]
                  .substring(0, 19)
                  .replace(/\s/g, '');
                let ooredooMatchRevealNumber =
                  ooredooRevealNumber.match(/^[0-9]{16}$/);

                //checking for ooredoo serial number
                let ooredooSerialNumberOne =
                  result[index].match(/^SN\W[0-9]{11}$/);
                let ooredooSerialNumberTwo = result[index].match(/^[0-9]{11}$/);
                let ooredooSerialNumberThree =
                  result[index].match(/^SN:\W[0-9]{11}$/);

                //checking for ooredoo amount
                let ooredooMvrAmountOne = result[index].match(/^MVR\W[0-9]*$/);
                let ooredooMvrAmountTwo = result[index].match(/^[0-9]{2}$/);
                let ooredooMvrAmountThree = result[index].match(/^[0-9]{3}$/);
                let ooredooMvrAmountFour =
                  result[index].match(/^Recharge\W[0-9]{2}$/);

                //if it exist then set the reveal number
                if (ooredooMatchRevealNumber) {
                  setRevealNumber(ooredooMatchRevealNumber[0]);
                }

                //if it exist then set the serial number
                if (ooredooSerialNumberOne) {
                  let digitOnlySerialNumber = ooredooSerialNumberOne[0].replace(
                    /\D/g,
                    '',
                  );
                  setSerialNumber(digitOnlySerialNumber);
                } else if (ooredooSerialNumberTwo) {
                  setSerialNumber(ooredooSerialNumberTwo[0]);
                } else if (ooredooSerialNumberThree) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberThree[0].replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                } else {
                  let ooredooSerialNumberSubstring = result.find((a: any) =>
                    a.includes('SN:'),
                  );
                  let ooredooSerialNumberSubstringTwo = result.find((a: any) =>
                    a.includes('SN'),
                  );
                  if (ooredooSerialNumberSubstring) {
                    let digitOnlySerialNumber =
                      ooredooSerialNumberSubstring.replace(/\D/g, '');
                    setSerialNumber(digitOnlySerialNumber);
                  } else if (ooredooSerialNumberSubstringTwo) {
                    let digitOnlySerialNumber =
                      ooredooSerialNumberSubstringTwo.replace(/\D/g, '');
                    setSerialNumber(digitOnlySerialNumber);
                  }
                }

                //if it exist then set the amount
                if (ooredooMvrAmountOne) {
                  let digitOnlyMvrAmount = ooredooMvrAmountOne[0].replace(
                    /\D/g,
                    '',
                  );
                  setAmount(digitOnlyMvrAmount);
                  setAmountChecked(digitOnlyMvrAmount);
                } else if (ooredooMvrAmountTwo) {
                  setAmount(ooredooMvrAmountTwo[0]);
                  setAmountChecked(ooredooMvrAmountTwo[0]);
                } else if (ooredooMvrAmountThree) {
                  setAmount(ooredooMvrAmountThree[0]);
                  setAmountChecked(ooredooMvrAmountThree[0]);
                } else if (ooredooMvrAmountFour) {
                  let digitOnlyMvrAmount = ooredooMvrAmountFour[0].replace(
                    /\D/g,
                    '',
                  );
                  setAmount(digitOnlyMvrAmount);
                  setAmountChecked(digitOnlyMvrAmount);
                }
              }
            } else if (dhiraagu || dhiraaguTwo) {
              //note: not checking for amount because it's not available on the same side as reveal number & serial number
              for (let index = 0; index < result?.length; index++) {
                let dhiraaguRemoveSpaceFromRevealNumber = result[index].replace(
                  /\D/g,
                  '',
                );

                let dhiraaguRevealNumber =
                  dhiraaguRemoveSpaceFromRevealNumber.match(/^\d{16}$/);

                let dhiraaguSerialNumberOne = result[index].match(/^\d{8}$/);

                if (dhiraaguRevealNumber) {
                  setRevealNumber(dhiraaguRevealNumber[0]);
                }

                if (dhiraaguSerialNumberOne) {
                  setSerialNumber(dhiraaguSerialNumberOne[0]);
                }
              }
            } else {
              //if dhiraagu or ooredoo is not recognized check for reveal number / serial number / amount
              for (let index = 0; index < result?.length; index++) {
                let removeSpaceFromRevealNumber = result[index].replace(
                  /\D/g,
                  '',
                );
                let revealNumber =
                  removeSpaceFromRevealNumber.match(/^\d{16}$/);
                if (revealNumber) {
                  setRevealNumber(revealNumber[0]);
                }
                let dhiraaguSerialNumber = result[index].match(/^\d{8}$/);

                let ooredooSerialNumberOne =
                  result[index].match(/^SN\W[0-9]{11}$/);
                let ooredooSerialNumberTwo = result[index].match(/^[0-9]{11}$/);
                let ooredooSerialNumberThree =
                  result[index].match(/^SN:\W[0-9]{11}$/);

                let ooredooMvrAmountOne = result[index].match(/^MVR\W[0-9]*$/);
                let ooredooMvrAmountTwo = result[index].match(/^[0-9]{2}$/);
                let ooredooMvrAmountThree = result[index].match(/^[0-9]{3}$/);
                let ooredooMvrAmountFour =
                  result[index].match(/^Recharge\W[0-9]{2}$/);

                if (dhiraaguSerialNumber) {
                  setSerialNumber(dhiraaguSerialNumber[0]);
                } else if (ooredooSerialNumberOne) {
                  let digitOnlySerialNumber = ooredooSerialNumberOne[0].replace(
                    /\D/g,
                    '',
                  );
                  setSerialNumber(digitOnlySerialNumber);
                } else if (ooredooSerialNumberTwo) {
                  setSerialNumber(ooredooSerialNumberTwo[0]);
                } else if (ooredooSerialNumberThree) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberThree[0].replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                } else if (ooredooMvrAmountOne) {
                  let digitOnlyMvrAmount = ooredooMvrAmountOne[0].replace(
                    /\D/g,
                    '',
                  );
                  setAmount(digitOnlyMvrAmount);
                  setAmountChecked(digitOnlyMvrAmount);
                } else if (ooredooMvrAmountTwo) {
                  setAmount(ooredooMvrAmountTwo[0]);
                  setAmountChecked(ooredooMvrAmountTwo[0]);
                } else if (ooredooMvrAmountThree) {
                  if (ooredooMvrAmountThree[0] != '140') {
                    setAmount(ooredooMvrAmountThree[0]);
                    setAmountChecked(ooredooMvrAmountThree[0]);
                  }
                } else if (ooredooMvrAmountFour) {
                  let digitOnlyMvrAmount = ooredooMvrAmountFour[0].replace(
                    /\D/g,
                    '',
                  );
                  setAmount(digitOnlyMvrAmount);
                  setAmountChecked(digitOnlyMvrAmount);
                } else {
                  let ooredooSerialNumberSubstring = result.find((a: any) =>
                    a.includes('SN:'),
                  );
                  let ooredooSerialNumberSubstringTwo = result.find((a: any) =>
                    a.includes('SN'),
                  );
                  if (ooredooSerialNumberSubstring) {
                    let digitOnlySerialNumber =
                      ooredooSerialNumberSubstring.replace(/\D/g, '');
                    setSerialNumber(digitOnlySerialNumber);
                  } else if (ooredooSerialNumberSubstringTwo) {
                    let digitOnlySerialNumber =
                      ooredooSerialNumberSubstringTwo.replace(/\D/g, '');
                    setSerialNumber(digitOnlySerialNumber);
                  }
                }
              }
            }
          } else {
            setRevealNumber('');
            setAmount('');
            setSerialNumber('');
            setChecked('');
            setAmountChecked('');
            setImageText('');
          }
          setIsCardLoading(false);
        }
      })();
    } catch (e) {
      console.log('error: ' + e);
    }
  }, [newImage]);
  console.log('count.');

  const [createCard, {loading: loadingCard}] = useMutation(ADD_CARD, {
    onCompleted: () => {
      showMessage({
        message: 'Successfully created card.',
        type: 'success',
      });
      setRevealNumber('');
      setAmount('');
      setSerialNumber('');
      setChecked('');
      setAmountChecked('');
    },
    onError: error => {
      showMessage({
        message: 'Unexpected error while creating card.',
        type: 'danger',
      });
      console.log('Unexpected error: ' + error);
    },
    refetchQueries: [],
  });

  const onClickSubmit = () => {
    const amountTwo = parseInt(amount);
    let noErrorFlag = true;
    console.log(newImage.path);
    if (checked! === '') {
      showMessage({
        message: 'Must select a brand',
        type: 'danger',
      });
      noErrorFlag = false;
    } else if (revealNumberErrors()) {
      showMessage({
        message: revealNumberError,
        type: 'danger',
      });
      noErrorFlag = false;
    } else if (serialNumberErrors()) {
      showMessage({
        message: serialNumberError,
        type: 'danger',
      });
      noErrorFlag = false;
    } else if (amountErrors()) {
      showMessage({
        message: amountError,
        type: 'danger',
      });
      noErrorFlag = false;
    }

    if (noErrorFlag) {
      /*
        const file = new ReactNativeFile({
          uri: image?.assets[0].uri!,
          name: image?.assets[0].fileName!,
          type: image?.assets[0].type!,
        });

        console.log('TYPE OF');
        console.log(typeof file);
      */
      /*
        createCard({
        variables: {
          brand: checked,
          revealNumber,
          serialNumber,
          amount: amountTwo,
        },
      });
     */

      //using form data to send to url
      const cardData = {
        brand: checked,
        revealNumber,
        serialNumber,
        amount: amountTwo,
      };
      const imageData = {
        uri: newImage.path,
        type: 'image/jpeg',
      };
      const body: any = new FormData();
      body.append('cardInfo', `${cardData}`);
      body.append('image', `${imageData}`);

      //change url here
      const url = 'https://fahipay.mv/api/rechargecardocr';
      fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: body,
      })
        .then(function (res) {
          if (res) {
            console.log(res);
            showMessage({
              message: 'Card created',
              type: 'success',
            });
          }
        })
        .catch(function (error) {//errors
          showMessage({
            message: error,
            type: 'danger',
          });
        })
        .finally(function () {

        });
    }
  };

  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;
  const cameraRef = useRef<Camera>(null);

  const takePicture = () => {
    try {
      console.log('PICTURE TAKEN');
      cameraRef.current
        ?.takePhoto({
          flash: 'auto',
          qualityPrioritization: 'speed',
        })
        .then((imageInfo: any) => {
          setNewImage(imageInfo);
        });
    } catch (e) {
      console.log('error: ' + e);
    } finally {
      setGalleryFlag(false);
      setIsLoading(false);
      showMessage({
        message: 'Picture taken.',
        type: 'success',
      });
    }
  };

  const debounceHandler = useCallback(debounce(takePicture, 300), []);

  //take picture using debounce
  const onClickTakePicture = () => {
    setIsLoading(true);
    setIsCardLoading(true);
    debounceHandler();
  };

  //show camera
  const onClickSetCameraFlag = () => {
    setCameraFlag(!cameraFlag);
  };

  //darkmode
  const onClickSetDarkModeFlag = () => {
    setDarkModeFlag(!darkModeFlag);
  };

  //preview image
  const onClickSetPreviewImageFlag = () => {
    if (galleryFlag) {
      setPreviewImageFlag(!previewImageFlag);
    } else if (newImage?.path) {
      setPreviewImageFlag(!previewImageFlag);
    } else {
      showMessage({
        message:
          "There's no image. Please use the camera or select from gallery.",
        type: 'danger',
      });
      setPreviewImageFlag(false);
    }
  };

  //styles
  const styles = EStyleSheet.create({
    column: {
      flex: 1,
      backgroundColor: darkModeFlag ? 'black' : 'white',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'left',
      color: darkModeFlag ? '#26bfa1' : 'black',
    },
    buttonWrapper: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    button: {
      borderRadius: 10,
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    buttonText: {
      color: darkModeFlag ? 'black' : 'white',
    },
    imageWrapper: {
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      height: 300,
      width: '100%',
      borderRadius: 20,
      borderWidth: 7,
      borderColor: '#26bfa1',
    },

    iconButton: {
      height: 46,
      width: 46,
      borderRadius: 46 / 2,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginHorizontal: 4,
    },
    icon: {
      color: darkModeFlag ? 'black' : 'white',
      fontSize: 22,
    },

    inputText: {
      fontWeight: '600',
      fontSize: 16,
      color: darkModeFlag ? '#26bfa1' : 'black',
      paddingHorizontal: 20,
    },
    inputWrapper: {
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 10,
    },
    input: {
      height: 46,
      backgroundColor: darkModeFlag ? '#777777' : '#f2f2f2',
      paddingHorizontal: 10,
      borderRadius: 10,
      color: 'black',
    },

    cardWrapper: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    ooredooCard: {
      backgroundColor: darkModeFlag ? '#494848' : 'white',
      borderRadius: 20,
      height: 200,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
      flexDirection: 'row',
    },
    ooredooRevealNumber: {
      fontSize: 14,
      color: 'black',
    },
    ooredooSerialNumber: {
      fontSize: 14,
      color: 'black',
      letterSpacing: 1,
    },
    ooredooMvrCircle: {
      width: 50,
      height: 50,
      borderRadius: 50,
      backgroundColor: darkModeFlag ? '#b10404' : 'red',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ooredooMvrCircleText: {
      fontSize: 8,
      color: darkModeFlag ? '#777777' : 'white',
      fontWeight: '700',
      textAlign: 'left',
    },
    ooredooMvrCircleAmount: {
      fontSize: 20,
      color: darkModeFlag ? '#777777' : 'white',
      fontWeight: '700',
    },
    ooredooCardName: {
      color: darkModeFlag ? '#b10404' : 'red',
      fontWeight: '700',
      fontSize: 14,
    },

    dhiraaguCard: {
      backgroundColor: darkModeFlag ? '#494848' : 'white',
      borderRadius: 20,
      height: 200,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    dhiraaguRevealNumber: {
      fontSize: 14,
      color: 'black',
    },
    dhiraaguSerialNumber: {
      fontSize: 14,
      color: 'black',
      letterSpacing: 1,
    },
    dhiraaguMvrText: {
      fontSize: 16,
      color: '#f57542',
      fontWeight: '700',
      textAlign: 'left',
    },
    dhiraaguMvrAmount: {
      fontSize: 36,
      color: '#f57542',
      fontWeight: '700',
      marginLeft: 5,
    },
    dhiraaguCardName: {
      color: '#f57542',
      fontWeight: '700',
      fontSize: 14,
    },

    containerStyle: {
      backgroundColor: darkModeFlag ? '#777777' : 'white',
      padding: 20,
      width: '90%',
      marginHorizontal: 20,
      justifyContent: 'center',
    },

    showTextButton: {
      height: 26,
      width: 26,
      borderRadius: 26 / 2,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginLeft: 'auto',
    },
    showTextIcon: {
      color: darkModeFlag ? 'black' : 'white',
      fontSize: 14,
    },

    radioButtonText: {
      color: darkModeFlag ? '#26bfa1' : 'black',
    },

    note: {
      color: darkModeFlag ? '#777777' : null,
    },
  });
  return (
    <>
      <FlashMessage position="top" />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.containerStyle}>
          <Text
            style={{
              fontWeight: '700',
              color: 'black',
              fontSize: 20,
              paddingBottom: 10,
            }}>
            Recognized Texts
          </Text>

          {imageText?.length > 0 ? (
            imageText?.map((text: any, index: number) => {
              return (
                <View key={index} style={{flexDirection: 'row'}}>
                  <Text style={{fontWeight: '700', color: 'black'}}>
                    {index + 1}){'  '}
                  </Text>
                  <Text>{text}</Text>
                </View>
              );
            })
          ) : (
            <Text style={{fontWeight: '400', color: 'black'}}>
              Couldn't recognize
            </Text>
          )}
        </Modal>
        <Modal visible={isLoading} style={{zIndex: 100}}>
          <ActivityIndicator animating={isLoading} color="#26bfa1" />
        </Modal>
      </Portal>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.column}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
          }}>
          <Text style={styles.title}>Card reader</Text>
        </View>
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <View style={{marginRight: 10}}>
              <Switches
                shape={'pill'}
                onChange={onClickSetCameraFlag}
                value={cameraFlag}
                icon={
                  <Icon
                    name="camera"
                    style={{
                      color: 'black',
                      fontSize: 16,
                    }}
                  />
                }
                buttonColor={darkModeFlag ? '#26bfa1' : '#FFFFFF'}
              />
            </View>
            <View style={{marginRight: 10}}>
              <Switches
                shape={'pill'}
                onChange={onClickSetPreviewImageFlag}
                value={previewImageFlag}
                icon={
                  <Icon
                    name="image"
                    style={{
                      color: 'black',
                      fontSize: 16,
                    }}
                  />
                }
                buttonColor={darkModeFlag ? '#26bfa1' : '#FFFFFF'}
              />
            </View>

            <Switches
              shape={'pill'}
              onChange={onClickSetDarkModeFlag}
              value={darkModeFlag}
              icon={
                <Icon
                  name="moon-o"
                  style={{
                    color: 'black',
                    fontSize: 16,
                  }}
                />
              }
              buttonColor={darkModeFlag ? '#26bfa1' : 'white'}
            />
          </View>

          <TouchableNativeFeedback onPress={pickPhoto} useForeground={true}>
            <LinearGradient
              start={{x: 0, y: 1}}
              end={{x: 1, y: 1}}
              colors={['#3AC170', '#25BFA3']}
              style={styles.iconButton}>
              <Icon name="image" style={styles.icon} />
            </LinearGradient>
          </TouchableNativeFeedback>
        </View>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: !cameraFlag && !previewImageFlag ? 20 : 0,
          }}>
          <Text style={styles.note}>
            Note: Must take photos vertically. (Photo taken from camera doesn't
            save inside your phone)
          </Text>
        </View>
        {previewImageFlag == true ? (
          <View style={styles.imageWrapper}>
            {galleryFlag == true ? (
              <Image
                source={{uri: newImage?.assets[0]?.uri}}
                style={styles.image}
              />
            ) : (
              <Image
                source={{uri: 'file://' + newImage?.path}}
                style={styles.image}
              />
            )}
          </View>
        ) : null}

        {device && permissions && cameraFlag ? (
          <View
            style={{
              overflow: 'hidden',
              margin: 20,
              borderRadius: 20,
              borderWidth: 7,
              borderColor: '#26bfa1',
            }}>
            <TouchableNativeFeedback onPress={onClickTakePicture}>
              <Camera
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 300,
                  overflow: 'hidden',
                  borderRadius: 10,
                }}
                ref={cameraRef}
                device={device}
                isActive={cameraFlag}
                photo={true}
              />
            </TouchableNativeFeedback>
          </View>
        ) : null}

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          {isCardLoading && (
            <Text
              style={{
                paddingRight: 10,
                color: darkModeFlag ? '#6d6c6c' : 'black',
              }}>
              Re-initializing card
            </Text>
          )}
          <ActivityIndicator animating={isCardLoading} color="#26bfa1" />
        </View>
        {checked == 'Ooredoo' ? (
          <View style={styles.cardWrapper}>
            <View style={styles.ooredooCard}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    paddingTop: 10,
                  }}>
                  <View style={{flex: 1}}>
                    <Text style={styles.ooredooCardName}>Recharge Card</Text>
                  </View>
                  <View style={styles.ooredooMvrCircle}>
                    <Text style={styles.ooredooMvrCircleText}>MVR.</Text>
                    <Text style={styles.ooredooMvrCircleAmount}>{amount}</Text>
                  </View>
                </View>
                <View style={{paddingBottom: 50}}>
                  <Text style={styles.ooredooCardName}>Ooredoo Card</Text>
                </View>
              </View>
              <View style={{width: 180}}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      marginTop: 10,
                      backgroundColor: darkModeFlag ? '#6d6c6c' : '#f1eee7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 40,
                    }}>
                    <Text style={styles.ooredooRevealNumber}>
                      {revealNumber?.toString().replace(/\d{4}(?=.)/g, '$& ')}
                    </Text>
                  </View>
                  <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
                    <Text style={styles.ooredooSerialNumber}>
                      SN: {serialNumber}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : checked == 'Dhiraagu' ? (
          <View style={styles.cardWrapper}>
            <View style={styles.dhiraaguCard}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}>
                <Text style={styles.dhiraaguCardName}>
                  Prepaid Recharge Voucher
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                  <Text style={styles.dhiraaguMvrText}>MVR</Text>
                  <Text style={styles.dhiraaguMvrAmount}>{amount}</Text>
                </View>
                <Text style={styles.dhiraaguCardName}>Dhiraagu Card</Text>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      backgroundColor: darkModeFlag ? '#6d6c6c' : '#f1eee7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 40,
                    }}>
                    <Text style={styles.ooredooRevealNumber}>
                      {revealNumber?.toString().replace(/\d{8}(?=.)/g, '$& ')}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingBottom: 10,
                      marginTop: 10,
                    }}>
                    <Text style={styles.ooredooSerialNumber}>
                      SN: {serialNumber}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 10,
          }}>
          <TouchableNativeFeedback onPress={() => setChecked('Dhiraagu')}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RadioButton
                value="Dhiraagu"
                status={checked === 'Dhiraagu' ? 'checked' : 'unchecked'}
                uncheckedColor={darkModeFlag && '#777777'}
                onPress={() => setChecked('Dhiraagu')}
              />
              <Text style={styles.radioButtonText}>Dhiraagu</Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => setChecked('Ooredoo')}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 10,
              }}>
              <RadioButton
                value="Ooredoo"
                status={checked === 'Ooredoo' ? 'checked' : 'unchecked'}
                uncheckedColor={darkModeFlag && '#777777'}
                onPress={() => setChecked('Ooredoo')}
              />
              <Text style={styles.radioButtonText}>Ooredoo</Text>
            </View>
          </TouchableNativeFeedback>
          {newImage && (
            <TouchableNativeFeedback onPress={showModal} useForeground={true}>
              <LinearGradient
                start={{x: 0, y: 1}}
                end={{x: 1, y: 1}}
                colors={['#3AC170', '#25BFA3']}
                style={styles.showTextButton}>
                <Icon name="question" style={styles.showTextIcon} />
              </LinearGradient>
            </TouchableNativeFeedback>
          )}
        </View>

        <Text style={styles.inputText}>Reveal Number</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={setRevealNumber}
            value={revealNumber}
            placeholder={'Reveal Number'}
            keyboardType="numeric"
            maxLength={16}
          />
          {revealNumberErrors() ? (
            <HelperText type="error" visible={revealNumberErrors()}>
              {revealNumberError}
            </HelperText>
          ) : null}
        </View>
        <Text style={styles.inputText}>Serial Number</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={setSerialNumber}
            value={serialNumber}
            placeholder={'Serial Number'}
            keyboardType="numeric"
            maxLength={
              checked === 'Dhiraagu' ? 8 : checked === 'Ooredoo' ? 11 : 16
            }
          />
          {serialNumberErrors() ? (
            <HelperText type="error" visible={serialNumberErrors()}>
              {serialNumberError}
            </HelperText>
          ) : null}
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.inputText}>Amount</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
            }}>
            <TouchableNativeFeedback
              onPress={() => {
                setAmountChecked('50');
                setAmount('50');
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                }}>
                <RadioButton
                  value="50"
                  status={amountChecked === '50' ? 'checked' : 'unchecked'}
                  uncheckedColor={darkModeFlag && '#777777'}
                  onPress={() => {
                    setAmountChecked('50');
                    setAmount('50');
                  }}
                />
                <Text style={styles.radioButtonText}>50</Text>
              </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback
              onPress={() => {
                setAmountChecked('100');
                setAmount('100');
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                }}>
                <RadioButton
                  value="100"
                  status={amountChecked === '100' ? 'checked' : 'unchecked'}
                  uncheckedColor={darkModeFlag && '#777777'}
                  onPress={() => {
                    setAmountChecked('100');
                    setAmount('100');
                  }}
                />
                <Text style={styles.radioButtonText}>100</Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={setAmount}
            value={amount}
            placeholder={'Amount'}
            keyboardType="numeric"
            maxLength={5}
          />
          {amountErrors() ? (
            <HelperText type="error" visible={amountErrors()}>
              {amountError}
            </HelperText>
          ) : null}
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableNativeFeedback onPress={onClickSubmit} useForeground={true}>
            <LinearGradient
              start={{x: 0, y: 1}}
              end={{x: 1, y: 1}}
              colors={['#3AC170', '#25BFA3']}
              style={styles.button}>
              <Text style={styles.buttonText}>Submit</Text>
            </LinearGradient>
          </TouchableNativeFeedback>
        </View>
      </ScrollView>
    </>
  );
};

export default App;

//previous one
/*
  const cameraSelect = () => {
    try {
      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: true,
          maxWidth: 2000,
          maxHeight: 2000,
        },
        onMediaSelect,
      );
    } catch (e) {
      console.log('error: ' + e);
    }
  };

useEffect(() => {
  (async () => {
    try {
      if (image) {
        const result = await TextRecognition.recognize(image?.assets[0]?.uri);
        if (result?.length > 0) {
          setImageText(result);
          //console.log(result);
          //console.log('length');
          //console.log(result?.length);
          setRevealNumber('');
          setAmount('');
          setSerialNumber('');
          setChecked('');
          setAmountChecked('');
          let ooredoo = result.find(a => a.toLowerCase().includes('ooredoo'));
          let dhiraagu = result.find(a =>
            a.toLowerCase().includes('dhiraagu'),
          );
          let dhiraaguTwo = result.find(a => a.toLowerCase().includes('141'));
          //check brand
          if (ooredoo) {
            setChecked('Ooredoo');
          } else if (dhiraagu) {
            setChecked('Dhiraagu');
          } else if (dhiraaguTwo) {
            setChecked('Dhiraagu');
          }

          if (ooredoo) {
            for (let index = 0; index < result?.length; index++) {
              //checking for ooredoo reveal number
              let ooredooRevealNumber = result[index]
                .substring(0, 19)
                .replace(/\s/g, '');
              let ooredooMatchRevealNumber =
                ooredooRevealNumber.match(/^[0-9]{16}$/);

              //checking for ooredoo serial number
              let ooredooSerialNumberOne =
                result[index].match(/^SN\W[0-9]{11}$/);
              let ooredooSerialNumberTwo = result[index].match(/^[0-9]{11}$/);
              let ooredooSerialNumberThree =
                result[index].match(/^SN:\W[0-9]{11}$/);

              //checking for ooredoo amount
              let ooredooMvrAmountOne = result[index].match(/^MVR\W[0-9]*$/);
              let ooredooMvrAmountTwo = result[index].match(/^[0-9]{2}$/);
              let ooredooMvrAmountThree = result[index].match(/^[0-9]{3}$/);
              let ooredooMvrAmountFour =
                result[index].match(/^Recharge\W[0-9]{2}$/);

              //if it exist then set the reveal number
              if (ooredooMatchRevealNumber) {
                setRevealNumber(ooredooMatchRevealNumber[0]);
              }

              //if it exist then set the serial number
              if (ooredooSerialNumberOne) {
                let digitOnlySerialNumber = ooredooSerialNumberOne[0].replace(
                  /\D/g,
                  '',
                );
                setSerialNumber(digitOnlySerialNumber);
              } else if (ooredooSerialNumberTwo) {
                setSerialNumber(ooredooSerialNumberTwo[0]);
              } else if (ooredooSerialNumberThree) {
                let digitOnlySerialNumber =
                  ooredooSerialNumberThree[0].replace(/\D/g, '');
                setSerialNumber(digitOnlySerialNumber);
              } else {
                let ooredooSerialNumberSubstring = result.find(a =>
                  a.includes('SN:'),
                );
                let ooredooSerialNumberSubstringTwo = result.find(a =>
                  a.includes('SN'),
                );
                if (ooredooSerialNumberSubstring) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberSubstring.replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                } else if (ooredooSerialNumberSubstringTwo) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberSubstringTwo.replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                }
              }

              //if it exist then set the amount
              if (ooredooMvrAmountOne) {
                let digitOnlyMvrAmount = ooredooMvrAmountOne[0].replace(
                  /\D/g,
                  '',
                );
                setAmount(digitOnlyMvrAmount);
                setAmountChecked(digitOnlyMvrAmount);
              } else if (ooredooMvrAmountTwo) {
                setAmount(ooredooMvrAmountTwo[0]);
                setAmountChecked(ooredooMvrAmountTwo[0]);
              } else if (ooredooMvrAmountThree) {
                setAmount(ooredooMvrAmountThree[0]);
                setAmountChecked(ooredooMvrAmountThree[0]);
              } else if (ooredooMvrAmountFour) {
                let digitOnlyMvrAmount = ooredooMvrAmountFour[0].replace(
                  /\D/g,
                  '',
                );
                setAmount(digitOnlyMvrAmount);
                setAmountChecked(digitOnlyMvrAmount);
              }
            }
          } else if (dhiraagu || dhiraaguTwo) {
            //note: not checking for amount because it's not available on the same side as reveal number & serial number
            for (let index = 0; index < result?.length; index++) {
              let dhiraaguRemoveSpaceFromRevealNumber = result[index].replace(
                /\D/g,
                '',
              );

              let dhiraaguRevealNumber =
                dhiraaguRemoveSpaceFromRevealNumber.match(/^\d{16}$/);

              let dhiraaguSerialNumberOne = result[index].match(/^\d{8}$/);

              if (dhiraaguRevealNumber) {
                setRevealNumber(dhiraaguRevealNumber[0]);
              }

              if (dhiraaguSerialNumberOne) {
                setSerialNumber(dhiraaguSerialNumberOne[0]);
              }
            }
          } else {
            //if dhiraagu or ooredoo is not recognized check for reveal number / serial number / amount
            for (let index = 0; index < result?.length; index++) {
              let removeSpaceFromRevealNumber = result[index].replace(
                /\D/g,
                '',
              );
              let revealNumber =
                removeSpaceFromRevealNumber.match(/^\d{16}$/);
              if (revealNumber) {
                setRevealNumber(revealNumber[0]);
              }
              let dhiraaguSerialNumber = result[index].match(/^\d{8}$/);

              let ooredooSerialNumberOne =
                result[index].match(/^SN\W[0-9]{11}$/);
              let ooredooSerialNumberTwo = result[index].match(/^[0-9]{11}$/);
              let ooredooSerialNumberThree =
                result[index].match(/^SN:\W[0-9]{11}$/);

              let ooredooMvrAmountOne = result[index].match(/^MVR\W[0-9]*$/);
              let ooredooMvrAmountTwo = result[index].match(/^[0-9]{2}$/);
              let ooredooMvrAmountThree = result[index].match(/^[0-9]{3}$/);
              let ooredooMvrAmountFour =
                result[index].match(/^Recharge\W[0-9]{2}$/);

              if (dhiraaguSerialNumber) {
                setSerialNumber(dhiraaguSerialNumber[0]);
              } else if (ooredooSerialNumberOne) {
                let digitOnlySerialNumber = ooredooSerialNumberOne[0].replace(
                  /\D/g,
                  '',
                );
                setSerialNumber(digitOnlySerialNumber);
              } else if (ooredooSerialNumberTwo) {
                setSerialNumber(ooredooSerialNumberTwo[0]);
              } else if (ooredooSerialNumberThree) {
                let digitOnlySerialNumber =
                  ooredooSerialNumberThree[0].replace(/\D/g, '');
                setSerialNumber(digitOnlySerialNumber);
              } else if (ooredooMvrAmountOne) {
                let digitOnlyMvrAmount = ooredooMvrAmountOne[0].replace(
                  /\D/g,
                  '',
                );
                setAmount(digitOnlyMvrAmount);
                setAmountChecked(digitOnlyMvrAmount);
              } else if (ooredooMvrAmountTwo) {
                setAmount(ooredooMvrAmountTwo[0]);
                setAmountChecked(ooredooMvrAmountTwo[0]);
              } else if (ooredooMvrAmountThree) {
                if (ooredooMvrAmountThree[0] != '140') {
                  setAmount(ooredooMvrAmountThree[0]);
                  setAmountChecked(ooredooMvrAmountThree[0]);
                }
              } else if (ooredooMvrAmountFour) {
                let digitOnlyMvrAmount = ooredooMvrAmountFour[0].replace(
                  /\D/g,
                  '',
                );
                setAmount(digitOnlyMvrAmount);
                setAmountChecked(digitOnlyMvrAmount);
              } else {
                let ooredooSerialNumberSubstring = result.find(a =>
                  a.includes('SN:'),
                );
                let ooredooSerialNumberSubstringTwo = result.find(a =>
                  a.includes('SN'),
                );
                if (ooredooSerialNumberSubstring) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberSubstring.replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                } else if (ooredooSerialNumberSubstringTwo) {
                  let digitOnlySerialNumber =
                    ooredooSerialNumberSubstringTwo.replace(/\D/g, '');
                  setSerialNumber(digitOnlySerialNumber);
                }
              }
            }
          }
        } else {
          setRevealNumber('');
          setAmount('');
          setSerialNumber('');
          setChecked('');
          setAmountChecked('');
          setImageText('');
        }
      }
    } catch (e) {
      console.log('error: ' + e);
    }
  })();
}, [image]);
*/
