"use client"
import { RootState } from '@/redux/store'
import { Leaf, ShoppingBasket, Smartphone, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { button } from 'motion/react-client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

function HeroSection() {
    const {userData}=useSelector((state:RootState)=>state.user)
    console.log(userData)
    const slides = [
        {
            id: 1,
            icon: <Leaf className='w-20 h-20 sm:h-28 text-green-400 drop-shadow-lg' />,
            title: "Fresh Organic Vegetables 🌿",
            subtitle:
                "Lazy feeling to shop ?Farm-fresh vegetables delivered to your doorstep every day.",
            btnText: "Shop Now",
            bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            id: 2,
            icon: (
                <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-red-400 drop-shadow-lg" />
            ),
            title: "Fast and reliable delivery 🚛",
            subtitle:
                "Juicy, handpicked fruits packed with natural goodness and flavor at your doorstep.",
            btnText: "Explore Fruits",
            bg: "https://images.unsplash.com/photo-1695653422952-93bf055732fe?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

        },
        {
            id: 3,
            icon: (
                <Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg" />
            ),
            title: "Daily Grocery Essentials through phone 📱 ",
            subtitle:
                "Everything you need for your home, all in one convenient place away from one click",
            btnText: "Browse Groceries",
            bg: "https://images.unsplash.com/photo-1730818877208-6063062ff177?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3DHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

        },
    ]

    const [current, setCurrent] = useState(0)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, []);
    return (
        <div className='relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl'>
            <AnimatePresence mode='wait'>
                <motion.div
                key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    exit={{ opacity: 0 }}
                    className='absolute inset-0'
                >
                    <Image src={slides[current].bg}
                        fill
                        alt='slide'
                        priority
                        className='object-cover'
                    />
                    <div className='absolute bg-black/50 backdrop-blur-[1px]'>

                    </div>

                </motion.div>
            </AnimatePresence>
            <div className='absolute inset-0 flex justify-center items-center text-center text-white px-6 '>
                <motion.div
                initial={{y:30,opacity:0}}
                animate={{y:0,opacity:1}}
                transition={{duration:0.6}}
                className='flex flex-col items-center justify-center gap-6 max-w-3xl'
                >
                    <div className='bg-white/10 backdrop-blur-md p-6  rounded-full shadow-l'>{slides[current].icon}</div>
                    <h1 className='text-3xl  sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg'>{slides[current].title}</h1>
                    <p className='text-lg sm:text-xl text-gray-200 max-w-2xl'>{slides[current].subtitle}</p>
                    <motion.button 
                    whileHover={{scale:1.29}}
                    whileTap={{scale:0.96}}
                    transition={{duration:0.2}}
                    className='mt-4 bg-white text-green-700 hover:bg-green-100 px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2'>
                        <ShoppingBasket className='w-5 h-5 '/>
                        {slides[current].btnText}
                    </motion.button>

                </motion.div>
            </div>
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3'>
            {slides.map((_,index)=>(
                <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                    index===current ? "bg-white w-6" : "bg-white/50"
                }`}
                />
            ))}
            </div>

        </div>
    )
}

export default HeroSection