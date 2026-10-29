// import React, { useEffect } from 'react'
// import L from "leaflet"
// import type { LatLngExpression, LeafletEvent } from 'leaflet'
// import { OpenStreetMapProvider } from 'leaflet-geosearch'
// import "leaflet/dist/leaflet.css"
// import { motion } from 'motion/react'
// import { useRouter } from 'next/navigation'
// import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
// interface ILocation {
//   latitude: number,
//   longitude: number
// }

// interface IProps {
//   userLocation: ILocation,
//   deliveryBoyLocation: ILocation
// }
// function Recenter({ positions }: { positions: [number, number] }) {
//   const map = useMap()
//   useEffect(() => {
//     if (positions[0] !== 0 && positions[1] !== 0) {
//       map.setView(positions, map.getZoom(), {
//         animate: true
//       })
//     }
//   }, [positions, map])

//   return null
// }
// function LiveMap({ userLocation, deliveryBoyLocation }: IProps) {
//   const deliveryBoyIcon = L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/1023/1023346.png",
//     iconSize: [45, 45]
//   })
//   const userIcon = L.icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/128/7720/7720526.png",
//     iconSize: [45, 45]
//   })

//   const linePositions = [
//     deliveryBoyIcon && userLocation ? [
//       [userLocation.latitude, userLocation.longitude],
//       [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
//     ] : []
//   ]

//   const center = deliveryBoyLocation
//     ? [deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]
//     : [userLocation.latitude, userLocation.longitude]

//   return (

//     <div className='w-full h-125 rounded-xl overflow-hidden shadow relative'>
//       <MapContainer center={center as LatLngExpression} zoom={13} scrollWheelZoom={true} className='w-full h-full'>
//         <Recenter positions={center as any} />
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}><Popup>Delivery Address</Popup>
//         </Marker>

//         {deliveryBoyLocation && <Marker position={[deliveryBoyLocation.latitude, deliveryBoyLocation.longitude]} icon={deliveryBoyIcon}><Popup>Delivery Boy</Popup></Marker>}
//         <Polyline positions={linePositions as any} color='green' />

//       </MapContainer>
//     </div>
//   )
// }

// export default LiveMap


"use client"

import React, { useEffect, useState } from "react"
import L from "leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"

interface ILocation {
  latitude: number
  longitude: number
}

interface IProps {
  userLocation: ILocation
  deliveryBoyLocation: ILocation
}

type RoutePoint = [number, number]

/* ---------------- Recenter Map ---------------- */

function Recenter({
  deliveryBoyLocation,
}: {
  deliveryBoyLocation: ILocation
}) {
  const map = useMap()

  useEffect(() => {
    if (
      deliveryBoyLocation.latitude !== 0 &&
      deliveryBoyLocation.longitude !== 0
    ) {
      map.panTo(
        [
          deliveryBoyLocation.latitude,
          deliveryBoyLocation.longitude,
        ],
        {
          animate: true,
          duration: 1,
        }
      )
    }
  }, [
    deliveryBoyLocation.latitude,
    deliveryBoyLocation.longitude,
    map,
  ])

  return null
}

/* ---------------- Live Map ---------------- */

function LiveMap({
  userLocation,
  deliveryBoyLocation,
}: IProps) {
  const [route, setRoute] = useState<RoutePoint[]>([])

  /* ---------------- Icons ---------------- */

  const deliveryBoyIcon = L.icon({
    iconUrl:
      "https://cdn-icons-png.flaticon.com/128/1023/1023346.png",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  })

  const userIcon = L.icon({
    iconUrl:
      "https://cdn-icons-png.flaticon.com/128/7720/7720526.png",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  })

  /* ---------------- Get Shortest Road Route ---------------- */

  useEffect(() => {
    if (
      !userLocation ||
      !deliveryBoyLocation ||
      userLocation.latitude === 0 ||
      userLocation.longitude === 0 ||
      deliveryBoyLocation.latitude === 0 ||
      deliveryBoyLocation.longitude === 0
    ) {
      return
    }

    const getRoute = async () => {
      try {
        const start = `${deliveryBoyLocation.longitude},${deliveryBoyLocation.latitude}`
        const end = `${userLocation.longitude},${userLocation.latitude}`

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        )

        const data = await response.json()

        if (data.routes?.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates

          const routeCoordinates: RoutePoint[] =
            coordinates.map(
              ([longitude, latitude]: [number, number]) => [
                latitude,
                longitude,
              ]
            )

          setRoute(routeCoordinates)
        }
      } catch (error) {
        console.error("Route error:", error)
      }
    }

    getRoute()
  }, [
    userLocation.latitude,
    userLocation.longitude,
    deliveryBoyLocation.latitude,
    deliveryBoyLocation.longitude,
  ])

  /* ---------------- Map Center ---------------- */

  const center: LatLngExpression = [
    deliveryBoyLocation.latitude,
    deliveryBoyLocation.longitude,
  ]

  return (
    <div className="w-full h-125 rounded-xl overflow-hidden shadow relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Follow delivery boy */}
        <Recenter
          deliveryBoyLocation={deliveryBoyLocation}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User / Delivery Address */}
        <Marker
          position={[
            userLocation.latitude,
            userLocation.longitude,
          ]}
          icon={userIcon}
        >
          <Popup>Delivery Address</Popup>
        </Marker>

        {/* Delivery Boy */}
        <Marker
          position={[
            deliveryBoyLocation.latitude,
            deliveryBoyLocation.longitude,
          ]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>

        {/* Shortest road route */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "green",
              weight: 5,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveMap

