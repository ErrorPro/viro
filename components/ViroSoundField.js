/**
 * Copyright (c) 2017-present, Viro Media, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ViroSoundField
 * @flow
 */
'use strict';

import { requireNativeComponent, View, findNodeHandle, Platform } from 'react-native';
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import React from 'react';

import PropTypes from 'prop-types';
import { checkMisnamedProps } from './Utilities/ViroProps';
var NativeModules = require('react-native').NativeModules;
var createReactClass = require('create-react-class');

var ViroSoundField = createReactClass({
  propTypes: {
    ...View.propTypes,

    // Source can either be a String referencing a preloaded file, a web uri, or a
    // local js file (using require())
    source: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./sound.mp3')
      PropTypes.number,
    ]).isRequired,

    paused: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    volume: PropTypes.number,
    rotation: PropTypes.arrayOf(PropTypes.number),
    onFinish: PropTypes.func,
    onError: PropTypes.func,
  },

  _onFinish: function(event: Event) {
    this.props.onFinish && this.props.onFinish(event);
  },

  _onError: function(event: Event) {
    this.props.onError && this.props.onError(event);
  },

  setNativeProps: function(nativeProps) {
    this._component.setNativeProps(nativeProps);
  },

  render: function() {
    checkMisnamedProps("ViroSoundField", this.props);

    var soundSrc = this.props.source;
    if (typeof soundSrc === 'number') {
      soundSrc = resolveAssetSource(soundSrc);
    } else if (typeof soundSrc === 'string') {
      soundSrc = {name: soundSrc};
    }

    let nativeProps = Object.assign({}, this.props);
    nativeProps.source = soundSrc;
    nativeProps.onErrorViro = this._onError;
    nativeProps.onFinishViro = this._onFinish;
    nativeProps.ref = component => {this._component = component; };

    return (
      <VRTSoundField {...nativeProps} />
    );
  },

  seekToTime(timeInSeconds) {
    switch (Platform.OS) {
      case 'ios':
        NativeModules.VRTSoundFieldManager.seekToTime(findNodeHandle(this), timeInSeconds);
        break;
      case 'android':
        NativeModules.UIManager.dispatchViewManagerCommand(
            findNodeHandle(this),
            NativeModules.UIManager.VRTSoundField.Commands.seekToTime,
            [ timeInSeconds ]);
        break;
    }
  },

});

var VRTSound = require('./ViroSound').VRTSound;

var VRTSoundField = requireNativeComponent(
  'VRTSoundField', ViroSoundField, {
    nativeOnly: {
      onFinishViro: true,
      onErrorViro: true,
    }
  }
);

module.exports = ViroSoundField;
