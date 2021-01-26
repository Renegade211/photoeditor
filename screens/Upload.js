import React, {useState} from 'react';
import {View, Text, Alert, Image} from 'react-native';
import {Button, Input} from 'react-native-elements';
import storage from '@react-native-firebase/storage';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';

export default function Upload() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [filename, setFilename] = useState('');
  const [isVisible, setVisible] = useState(false);

  const selectImage = () => {
    ImagePicker.openPicker({
      cropping: true,
    })
      .then((image) => {
        setImage(image.path);
      })
      .catch((err) => console.log(err));
  };

  const onUpload = () => {
    setVisible(true);
  };

  const uploadImage = async () => {
    setVisible(false);
    setUploading(true);
    setTransferred(0);
    const task = storage().ref(filename).putFile(image);
    task.on('state_changed', (snapshot) => {
      setTransferred(
        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      );
    });
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    Alert.alert(
      'Photo uploaded!',
      'Your photo has been uploaded to Firebase Cloud Storage',
    );
    setImage(null);
    setFilename('');
  };

  return (
    <View>
      <Button
        title="Pick an image"
        type="outline"
        raised
        containerStyle={{width: 150, alignSelf: 'center', marginTop: 5}}
        buttonStyle={{borderRadius: 20, borderWidth: 1}}
        onPress={selectImage}
      />
      <View style={{alignItems: 'center'}}>
        {image !== null ? (
          <Image
            source={{uri: image}}
            style={{width: 300, height: 300, margin: 5}}
          />
        ) : null}
      </View>
      {uploading && <Text style={{fontSize: 25}}>{transferred} / 100 %</Text>}
      <Button
        title="Upload an image"
        type="outline"
        raised
        containerStyle={{width: 150, alignSelf: 'center', margin: 5}}
        buttonStyle={{borderRadius: 20, borderWidth: 1}}
        onPress={onUpload}
      />
      <Modal
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={isVisible}
        onBackButtonPress={() => setVisible(false)}
        style={{position: 'absolute', marginTop: '50%'}}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 5,
          }}>
          <Text style={{fontSize: 25}}>
            Type how you want your image to be uploaded
          </Text>
          <Input
            placeholder="Type here..."
            value={filename}
            onChangeText={(value) => setFilename(value)}
          />
          <Button
            title="Set name and upload"
            type="outline"
            raised
            containerStyle={{width: 200, alignSelf: 'center', margin: 5}}
            buttonStyle={{borderRadius: 20, borderWidth: 1}}
            onPress={uploadImage}
          />
        </View>
      </Modal>
    </View>
  );
}
