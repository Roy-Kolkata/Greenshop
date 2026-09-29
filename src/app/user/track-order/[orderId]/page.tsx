"use client"
import LiveMap from '@/components/LiveMap'
import { getSocket } from '@/lib/socket'
import { IMessage } from '@/models/message.model'
import { IUser } from '@/models/user.model'
import { RootState } from '@/redux/store'
import axios from 'axios'
import { ArrowLeft, Send, Sparkle } from 'lucide-react'
import mongoose from 'mongoose'
import { AnimatePresence, motion } from 'motion/react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'



interface IOrder {
  _id?: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  items: {
    grocery: mongoose.Types.ObjectId,
    name: string,
    price: string,
    unit: string,
    image: string,
    quantity: number
  }[],
  isPaid: boolean,
  totalAmount: number,
  paymentMethod: "cod" | "online",
  address: {
    fullName: string,
    mobile: string,
    city: string,
    state: string,
    pincode: string,
    fullAddress: string,
    latitude: number,
    longitude: number
  }
  assignment?: mongoose.Types.ObjectId,
  assignedDeliveryBoy?: IUser
  status: "pending" | "out of delivery" | "delivered"
  createdAt?: Date
  updateAt?: Date
}

interface ILocation {
  latitude: number,
  longitude: number
}

function TrackOrder({ params }: { params: { orderId: string } }) {

  const { userData } = useSelector((state: RootState) => state.user)
  const { orderId } = useParams()
  const [order, setOrder] = useState<IOrder>()
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<IMessage[]>()
  const chatBoxRef=useRef<HTMLDivElement>(null)
  const router = useRouter()
  const[suggestions,setSuggestions]=useState([
          "Hello","Thank You","Wait"
      ])
  const [userLocation, setUserLocation] = useState<ILocation>(
    {
      latitude: 0,
      longitude: 0
    }
  )
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>(
    {
      latitude: 0,
      longitude: 0
    }
  )

  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`)
        setOrder(result.data)
        setUserLocation({
          latitude: result.data.address.latitude,
          longitude: result.data.address.longitude,
        })
        setDeliveryBoyLocation({
          latitude: result.data.assignedDeliveryBoy.location.coordinates[1],
          longitude: result.data.assignedDeliveryBoy.location.coordinates[0],
        })
        console.log(result)
      } catch (error) {
        console.log(error)
      }
    }
    getOrder()
  }, [userData?._id])

  useEffect((): any => {
    const socket = getSocket()
    socket.on("update-deliveryBoy-location", (data) => {
      console.log(location)
      setDeliveryBoyLocation({
        latitude: data.location.coordinates?.[1] ?? data.location.latitude,
        longitude: data.location.coordinates?.[0] ?? data.location.longitude
      })
    })
    return () => socket.off("update-deliveryBoy-location")
  }, [order])

  useEffect(() => {
    const socket = getSocket()
    socket.emit("join-room", orderId)
    socket.on("send-message", (message) => {
      if (message.roomId === orderId) {
        setMessages((prev) => [...prev!, message])
      }
    })
    return ()=>{
      socket.off("send-message")
    }
  }, [])

  const sendMsg = () => {
    const socket = getSocket()
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
    socket.emit("send-message", message)
    setNewMessage("")
  }

  useEffect(() => {
        chatBoxRef.current?.scrollTo({
          top:chatBoxRef.current.scrollHeight,
          behavior:"smooth"
        })
      }, [messages])

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/messages", { roomId: orderId })
        setMessages(result.data)
        console.log(result)
      } catch (error) {
        console.log(error)
      }
    }
    getAllMessages()
  }, [])
  return (
    <div className='w-full min-h-screen bg-linear-to-b from-green-50 to-white'>
      <div className='max-w-2xl mx-auto pb-24'>
        <div className='sticky top-0 bg-white/80 backdrop-blur-xl  p-4 border-b shadow flex gap-3 items-center z-999'>
          <button className='p-2 bg-green-100 rounded-full' onClick={() => router.back()}><ArrowLeft className='text-green-700' size={20} /></button>
          <div>
            <h2 className='text-xl font-bold'>Track Order</h2>
            <p className='text-sm text-gray-600'>order #{order?._id!.toString()} <span className='text-green-700 font-semibold'>{order?.status}</span></p>
          </div>
        </div>
        <div className='px-4 mt-6 space-y-4'>
          <div className='rounded-3xl overflow-hidden border shadow'>
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation} />
          </div>


          <div className='bg-white rounded-3xl shadow-lg border p-4 h-107.5 flex flex-col'>

             <div className='flex justify-between items-center mb-3'>
                <span className='font-semibold text-gray-700 text-sm'>Quick Replies</span>
                <motion.button 
                whileTap={{scale:0.9}}
                className='px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer'
                ><Sparkle size={14}/>AI suggest</motion.button>
            </div>

            <div className='flex gap-2 flex-wrap mb-3'>
                {suggestions.map((s,i)=>(
                    <motion.div 
                    key={s} 
                    whileTap={{scale:0.92}} 
                    className='px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full cursor-pointer' onClick={()=>setNewMessage(s)}>
                        {s}
                    </motion.div>
                ))}

            </div>


            <div className='flex-1 overflow-y-auto p-2 space-y-3' ref={chatBoxRef}>
              <AnimatePresence>
                {messages?.map((msg, index) => (
                  <motion.div key={msg._id?.toString() || `${msg.senderId}-${msg.time}-${index}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.senderId == userData?._id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2 max-w[75%] rounded-2xl shadow ${msg.senderId === userData?._id
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}>
                      <p className=''>{msg.text}</p>
                      <p className='text-[10px] opacity-70  mt-1 text-right'>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className='flex gap-2 mt-3 border-t pt-3'>
              <input type="text" placeholder='Type a message...' className='flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button className='bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white' onClick={sendMsg}><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackOrder