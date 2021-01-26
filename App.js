import React, {useState} from 'react';
import {View, PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import PhotoEditor from 'react-native-photo-editor';
import {Header, Button, Input, Text, Image} from 'react-native-elements';
import Upload from './screens/Upload';
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'react-native-fetch-blob';
import Modal from 'react-native-modal';

export default function App() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isVisible, setVisible] = useState(false);
  const [image, setImage] = useState('');

  const edit = (name) => {
    PhotoEditor.Edit({
      path: `${RNFS.ExternalStorageDirectoryPath}/Download/${name}`,
      onDone: (filePath) => {
        RNFS.moveFile(
          filePath,
          `${RNFS.ExternalStorageDirectoryPath}/Pictures/${name}`,
        )
          .then((success) => console.log('Success'))
          .catch((err) => console.log(err));
        setName('');
        alert('Saved to Pictures directory');
      },
    });
  };

  const permission = async () => {
    try {
      const rgranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'React Native Read Permission',
          message: 'Reading Permission is needed',
        },
      );
      const wgranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'React Native Write Permission',
          message: 'Writing Permission is needed',
        },
      );
      if (
        rgranted === PermissionsAndroid.RESULTS.GRANTED &&
        wgranted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        edit(name);
      } else {
        console.log('No permission');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onDownload = () => {
    setVisible(true);
  };

  const getImage = () => {
    storage()
      .ref(image)
      .getDownloadURL()
      .then((url) => {
        setUrl(url);
      })
      .catch((err) => console.log(err));
  };

  const downloadImage = (url) => {
    RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
      path: `${RNFS.ExternalStorageDirectoryPath}/Download/${image}`,
    })
      .fetch('GET', url)
      .then((res) => alert('Saved to Download directory'));
    setVisible(false);
    setImage('');
    setUrl('');
  };

  const handler = () => {
    if (name === '') {
      alert('Please enter a file name');
    } else {
      permission();
    }
  };

  return (
    <View>
      <Header
        centerComponent={{
          text: 'PhotoEditor',
          style: {color: 'white', fontSize: 30},
        }}
      />
      <Input
        placeholder="Type file name..."
        value={name}
        onChangeText={(value) => setName(value)}
      />
      <Button
        title="Edit"
        type="outline"
        raised
        onPress={handler}
        containerStyle={{width: 150, alignSelf: 'center'}}
        buttonStyle={{borderRadius: 20, borderWidth: 1}}
      />
      <Upload />
      <Button
        title="Download"
        type="outline"
        raised
        containerStyle={{width: 150, alignSelf: 'center'}}
        buttonStyle={{borderRadius: 20, borderWidth: 1}}
        onPress={onDownload}
      />
      <Modal
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={isVisible}
        onBackButtonPress={() => setVisible(false)}
        style={{margin: 0}}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            padding: 5,
          }}>
          <Text style={{fontSize: 25}}>Type image you want to download</Text>
          <Input
            placeholder="Type here..."
            value={image}
            onChangeText={(value) => setImage(value)}
            containerStyle={{alignSelf: 'center'}}
          />
          <Button
            title="Get URL"
            type="outline"
            raised
            containerStyle={{width: 150, alignSelf: 'center'}}
            buttonStyle={{borderRadius: 20, borderWidth: 1}}
            onPress={getImage}
          />
          {url !== '' && (
            <Image
              source={{uri: url}}
              containerStyle={{
                width: 300,
                height: 300,
                margin: 5,
                alignSelf: 'center',
              }}
            />
          )}
          <Button
            title="Download"
            type="outline"
            raised
            containerStyle={{width: 150, alignSelf: 'center', margin: 5}}
            buttonStyle={{borderRadius: 20, borderWidth: 1}}
            onPress={() => downloadImage(url)}
          />
        </View>
      </Modal>
    </View>
  );
}
