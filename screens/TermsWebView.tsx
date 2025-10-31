import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, BackHandler, Image, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from '../lib/tailwind/tailwind';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteParams = { url?: string; title?: string };

const TermsWebView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url = 'https://rexchange-next.vercel.app/terms', title = 'End User License Agreement' } =
    (route.params as RouteParams) || {};
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Android hardware back: navigate web history first
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      // fallback to normal back
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const renderLoading = () => (
    <View style={tw`flex-1 items-center justify-center`}>
      <ActivityIndicator />
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Simple in-view header for consistent styling, within SafeArea */}
      <View style={tw`flex-row items-center justify-between px-4 py-3 border-b border-gray-200`}>
        <Pressable onPress={() => navigation.goBack()} style={tw`p-2`}>
          <Image source={require('../assets/times_gray.png')} />
        </Pressable>
        <Text style={tw`font-rajdhani700 text-purple`}>{title}</Text>
        <View style={tw`w-6`} />
      </View>

      {error ? (
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Text style={tw`font-overpass500 text-center mb-4`}>Failed to load. Please try again.</Text>
          <Pressable
            onPress={() => {
              setError(null);
              webRef.current?.reload();
            }}
            style={tw`px-4 py-2 rounded bg-purple`}
          >
            <Text style={tw`text-white font-overpass600`}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webRef}
          source={{ uri: url }}
          onNavigationStateChange={onNavStateChange}
          startInLoadingState
          renderLoading={renderLoading}
          onError={() => setError('load')}
        />
      )}
    </SafeAreaView>
  );
};

export default TermsWebView;
