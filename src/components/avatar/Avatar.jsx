import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAvatarContext } from '../../context/AvatarContext.jsx';

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.17,
    noseSneerRight: 0.14,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
};

const corresponding = {
  A: 'viseme_PP',
  B: 'viseme_kk',
  C: 'viseme_I',
  D: 'viseme_AA',
  E: 'viseme_O',
  F: 'viseme_U',
  G: 'viseme_FF',
  H: 'viseme_TH',
  X: 'viseme_PP',
};

export function Avatar(props) {
  const { nodes, scene } = useGLTF('/models/64f1a714fe61576b46f27ca2.glb');
  const { animations } = useGLTF('/models/animations.glb');
  const { message, onMessagePlayed } = useAvatarContext();

  const [lipsync, setLipsync] = useState(null);
  const [audio, setAudio] = useState(null);
  const [facialExpression, setFacialExpression] = useState('default');

  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState(() =>
    animations.find((a) => a.name === 'Idle') ? 'Idle' : animations[0]?.name
  );

  useEffect(() => {
    if (!message) {
      setAnimation('Idle');
      return;
    }
    setAnimation(message.animation || 'Talking_0');
    setFacialExpression(message.facialExpression || 'default');
    setLipsync(message.lipsync || null);

    if (message.audio) {
      const aud = new Audio('data:audio/mp3;base64,' + message.audio);
      aud.play().catch(() => {});
      setAudio(aud);
      aud.onended = onMessagePlayed;
    } else if (message.ttsText && 'speechSynthesis' in window) {
      setAudio(null);
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message.ttsText);
      utter.onend = onMessagePlayed;
      window.speechSynthesis.speak(utter);
    } else {
      onMessagePlayed();
    }
  }, [message, onMessagePlayed]);

  useEffect(() => {
    if (!animation || !actions[animation]) return;
    actions[animation]
      .reset()
      .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
      .play();
    return () => actions[animation]?.fadeOut(0.5);
  }, [animation, actions, mixer]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (!child.isSkinnedMesh || !child.morphTargetDictionary) return;
      const idx = child.morphTargetDictionary[target];
      if (idx === undefined || child.morphTargetInfluences[idx] === undefined) return;
      child.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
        child.morphTargetInfluences[idx],
        value,
        speed
      );
    });
  };

  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let t;
    const next = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); next(); }, 200);
      }, THREE.MathUtils.randInt(1500, 5000));
    };
    next();
    return () => clearTimeout(t);
  }, []);

  const morphDictRef = useRef(null);
  useEffect(() => {
    if (nodes?.EyeLeft?.morphTargetDictionary) {
      morphDictRef.current = nodes.EyeLeft.morphTargetDictionary;
    }
  }, [nodes]);

  useFrame(() => {
    const dict = morphDictRef.current;
    if (dict) {
      Object.keys(dict).forEach((key) => {
        if (key === 'eyeBlinkLeft' || key === 'eyeBlinkRight') return;
        const expr = facialExpressions[facialExpression] || {};
        lerpMorphTarget(key, expr[key] ?? 0, 0.1);
      });
    }

    lerpMorphTarget('eyeBlinkLeft', blink ? 1 : 0, 0.5);
    lerpMorphTarget('eyeBlinkRight', blink ? 1 : 0, 0.5);

    const appliedMorphTargets = [];
    if (message && lipsync && audio) {
      const t = audio.currentTime;
      for (const cue of lipsync.mouthCues || []) {
        if (t >= cue.start && t <= cue.end) {
          const viseme = corresponding[cue.value];
          if (viseme) {
            appliedMorphTargets.push(viseme);
            lerpMorphTarget(viseme, 1, 0.2);
          }
          break;
        }
      }
    }
    Object.values(corresponding).forEach((v) => {
      if (!appliedMorphTargets.includes(v)) lerpMorphTarget(v, 0, 0.1);
    });
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/64f1a714fe61576b46f27ca2.glb');
useGLTF.preload('/models/animations.glb');
