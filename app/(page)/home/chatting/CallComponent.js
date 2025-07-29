'use client';

import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import imagePaths from "../../../utils/imagesPath";
import {useAppData} from "../../../masterData/AppDataContext";
import {isDevMode} from "../../../api/apiEndpoints";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import {getDataById} from "../../../utils/utils";

const CallComponent = () => {
    const {usersData} = useAppData();
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const peerRef = useRef(null);
    const callRef = useRef(null);
    const streamRef = useRef(null);
    const ringtoneRef = useRef(null);
    const timerRef = useRef(null);
    const recorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const [callDuration, setCallDuration] = useState(0);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    // const location = useLocation();
    // const { remoteUserId } = location.state || {};
    const { remoteUserId } = null;

    useEffect(() => {
        ringtoneRef.current = new Audio(imagePaths.ringtone);
        ringtoneRef.current.loop = true;
    }, []);

    useEffect(() => {
        if (incomingCall) {
            ringtoneRef.current.play().catch(() => {});
            if (navigator.vibrate) navigator.vibrate([500, 500, 500]);
        } else {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            if (navigator.vibrate) navigator.vibrate(0);
        }
    }, [incomingCall]);

    useEffect(() => {
        if (callActive) {
            timerRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setCallDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [callActive]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        const peer = new Peer(getLocalData(appKeys._id), {
            host: isDevMode ? 'localhost' : 'empbackend-aru4.onrender.com',
            path: '/peerjs/myapp',
            secure: !isDevMode,
            ...(isDevMode && { port: 5201 }),
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject'
                    }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('My peer ID:', id);
        });

        peer.on('call', (call) => {
            setIncomingCall(call);
        });

        peerRef.current = peer;

        return () => peer.destroy();
    }, [getLocalData(appKeys._id)]);

    const startRecording = () => {
        if (!localRef.current?.srcObject) return;
        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(localRef.current.srcObject);
        recorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'call_recording.webm';
            a.click();
            URL.revokeObjectURL(url);
        };

        recorder.start();
    };

    const stopRecording = () => {
        recorderRef.current?.stop();
    };

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const sender = callRef.current.peerConnection.getSenders().find((s) => s.track.kind === 'video');
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
            localRef.current.srcObject = screenStream;

            screenStream.getVideoTracks()[0].addEventListener('ended', async () => {
                if (streamRef.current) {
                    const sender = callRef.current.peerConnection.getSenders().find((s) => s.track.kind === 'video');
                    await sender.replaceTrack(streamRef.current.getVideoTracks()[0]);
                    localRef.current.srcObject = streamRef.current;
                }
            });
        } catch (error) {
            console.error('Screen share error:', error);

        }
    };

    const startCall = () => {
        navigator.permissions.query({ name: 'camera' }).then(console.log);
        navigator.permissions.query({ name: 'microphone' }).then(console.log);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                console.log("stream=>", stream);
                streamRef.current = stream;
                localRef.current.srcObject = stream;

                const call = peerRef.current.call(remoteUserId, stream);
                callRef.current = call;
                console.log("call=>", call);

                if (!call) {
                    console.error('Failed to initiate call. Peer connection not ready.');
                    return;
                }

                call.on('stream', (remoteStream) => {
                    console.log("remoteStream=>", remoteStream);
                    remoteRef.current.srcObject = remoteStream;
                    setCallActive(true);
                });

                call.on('close', handleEndCall);
            })
            .catch((err) => console.error('Failed to get media devices:', err));
    };

    const handleAcceptCall = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                streamRef.current = stream;
                localRef.current.srcObject = stream;

                incomingCall.answer(stream);
                callRef.current = incomingCall;

                incomingCall.on('stream', (remoteStream) => {
                    remoteRef.current.srcObject = remoteStream;
                    setCallActive(true);
                });

                incomingCall.on('close', handleEndCall);
                setIncomingCall(null);
            })
            .catch((err) => console.error('Failed to get media devices:', err));
    };

    const handleRejectCall = () => {
        incomingCall?.close();
        setIncomingCall(null);
    };

    const handleEndCall = () => {
        callRef.current?.close();
        streamRef.current?.getTracks().forEach((track) => track.stop());

        localRef.current.srcObject = null;
        remoteRef.current.srcObject = null;

        setCallActive(false);
        setIncomingCall(null);
        setAudioEnabled(true);
        setVideoEnabled(true);
        stopRecording();
    };

    const toggleMute = () => {
        streamRef.current?.getAudioTracks().forEach((track) => track.enabled = !track.enabled);
        setAudioEnabled((prev) => !prev);
    };

    const toggleCamera = () => {
        streamRef.current?.getVideoTracks().forEach((track) => track.enabled = !track.enabled);
        setVideoEnabled((prev) => !prev);
    };

    const switchToAudioOnly = () => {
        streamRef.current?.getVideoTracks().forEach((track) => (track.enabled = false));
        setVideoEnabled(false);
    };

    const switchToVideo = () => {
        streamRef.current?.getVideoTracks().forEach((track) => (track.enabled = true));
        setVideoEnabled(true);
    };

    return (
        <div style={{
            background: '#f5f7fa',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '900px',
            margin: '30px auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Video Call</h2>
            <div style={{ textAlign: 'center', color: '#888', marginBottom: 20 }}>
                You: <strong>{getDataById(usersData, getLocalData(appKeys._id)).fullName}</strong> | Talking to: <strong>{getDataById(usersData, remoteUserId).fullName}</strong>
            </div>

            {callActive && (
                <div style={{ textAlign: 'center', fontSize: 16, marginBottom: 10 }}>
                    Duration: <strong>{formatDuration(callDuration)}</strong>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexDirection: "column" }}>
                <video ref={localRef} autoPlay muted width="600px" style={{ borderRadius: '8px', background: '#000', maxWidth: "600px" }} />
                <video ref={remoteRef} autoPlay width="600px" style={{ borderRadius: '8px', background: '#000', maxWidth: "600px" }} />
            </div>

            {!callActive && !incomingCall && (
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <button onClick={startCall} style={btnPrimary}>Start Call</button>
                </div>
            )}

            {incomingCall && !callActive && (
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <h3>📞 Incoming call from: {getDataById(usersData, incomingCall.peer).fullName}</h3>
                    <button onClick={handleAcceptCall} style={btnAccept}>Accept</button>
                    <button onClick={handleRejectCall} style={btnReject}>Reject</button>
                </div>
            )}

            <div style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={switchToAudioOnly} style={btnSecondary}>Audio Only</button>
                <button onClick={switchToVideo} style={btnSecondary}>Video On</button>
                <button onClick={startRecording} style={btnSecondary}>Start Recording</button>
                <button onClick={stopRecording} style={btnSecondary}>Stop Recording</button>
                <button onClick={startScreenShare} style={btnSecondary}>Share Screen</button>
            </div>

            {callActive && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <button onClick={handleEndCall} style={btnEnd}>End Call</button>
                    <button onClick={toggleMute} style={btnSecondary}>
                        {audioEnabled ? 'Mute Mic' : 'Unmute Mic'}
                    </button>
                    <button onClick={toggleCamera} style={btnSecondary}>
                        {videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                    </button>
                </div>
            )}
        </div>
    );
};

const btnPrimary = {
    padding: '10px 20px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
};

const btnSecondary = {
    ...btnPrimary,
    background: '#6c757d',
    margin: '0 8px',
};

const btnAccept = {
    ...btnPrimary,
    background: '#28a745',
    marginRight: '10px',
};

const btnReject = {
    ...btnPrimary,
    background: '#dc3545',
};

const btnEnd = {
    ...btnPrimary,
    background: '#ff4444',
    marginRight: '10px',
};

export default CallComponent;
