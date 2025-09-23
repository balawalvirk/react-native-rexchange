import React, { useEffect } from 'react';
import { Pressable, View, Image, BackHandler, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../../lib/helpers/dimensions';
import tw from '../../lib/tailwind/tailwind';
interface ImageSliderModalProps {
  state: {
    show: boolean;
    index: number;
  };
  imageUrls: any;
  setState: any;
  onClose: () => any;
}

const ImageSliderModal: React.FC<ImageSliderModalProps> = ({
  state,
  imageUrls,
  setState,
  onClose,
}) => {
  const handleCloseClick = () => {
    setState({ ...state, show: false });
    onClose();
  };

  // Handle Android back button to close image preview
  useEffect(() => {
    if (!state.show) return; // Only handle back button when modal is visible

    const backAction = () => {
      handleCloseClick();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [state.show, setState, onClose]);

  return (
    <Modal
      visible={state.show}
      transparent={false}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleCloseClick}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
      >
        <ImageViewer
          style={{
            flex: 1,
          }}
          show={true}
          imageUrls={imageUrls}
          index={state.index}
        />
        <Pressable
          style={tw`absolute top-16 right-6 z-10`}
          onPress={handleCloseClick}
        >
          <Image
            style={tw`w-6 h-6 border-1 border-white rounded-full`}
            source={require('../../assets/times_white.png')}
          />
        </Pressable>
      </View>
    </Modal>
  );
};

export default ImageSliderModal;
