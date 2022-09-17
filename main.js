let APP_ID = "e3586406206f45919517b3ec675b3398";
let token = null;
let uid = String(Math.floor(Math.random() * 10000));
let client,channel;
let localStream,remoteStream,peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}

let init = async() => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    channel = client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)
    client.on('MessageFromPeer',handleMessageFromPeer)
    channel.on('MemberLeft', handleUserLeft)

    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    document.getElementById('user-1').srcObject = localStream
}

let handleMessageFromPeer = async(message,MemberId) => {
    console.log("Message: ",message.text)
}

let handleUserJoined = async(MemberId) => {
    console.log('User Joined !')
    createOffer(MemberId)
}

let handleUserLeft = async(MemberId) => {
    console.log('User Left !')
}
let createOffer = async(MemberId) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async(event) => {
        if(event.candidate){
            console.log('ICE CANDIDATE !')
        }
    }
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    client.sendMessageToPeer({text:'Hey, '},MemberId)
}
init()