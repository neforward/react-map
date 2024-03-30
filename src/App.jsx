import { Button, Divider, Flex, Input, Typography } from 'antd'
import { useEffect, useState } from "react"
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const AutoFitBound = ({ bounds }) => {
  const map = useMap()
  useEffect(() => {
    if (!map || bounds.length === 0) return
    map.fitBounds(bounds)
  }, [map, bounds])
  return null
}

function App() {
  const baseURL = 'http://router.project-osrm.org/route/v1/driving/'
  const [positionA, setPositionA] = useState({ lat: 42.879564, lng: 74.600198 });
  const [positionB, setPositionB] = useState({ lat: 42.2600, lng: 77.1100 });
  const [mapCenter, setMapCenter] = useState({ lat: 42.880273389829355, lng: 74.58899823741628 });
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState(null)
  const [points, setPoints] = useState([])
  const [bounds, setBounds] = useState([])
  const getRoute = async () => {
    const res = await fetch(baseURL + `${positionA.lng},${positionA.lat};${positionB.lng},${positionB.lat}` + `?geometries=geojson`)

    const data = await res.json()
    setRoute(data)
  }
  const location = () => {
    const showLocation = position => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      console.log({ lat: latitude, lng: longitude });
      setPositionA({ lat: latitude, lng: longitude })
    }
    navigator.geolocation.watchPosition(showLocation)
  }

  useEffect(() => {
    location()
    getRoute()
  }, [])

  const [showPolygon, setShowPolygon] = useState(false);
  useEffect(() => {
    if (route) {
      const points = route.routes[0].geometry.coordinates.map(arr => [arr[1], arr[0]])
      setPoints(points)
      const originPoint = { lat: points[0][0], lng: points[0][1] }
      const destinationPoint = {
        lat: points[points.length - 1][0],
        lng: points[points.length - 1][1],
      }
      setPositionA(originPoint)
      setPositionB(destinationPoint)
      const newBounds = [originPoint, destinationPoint].map(m => [m.lat, m.lng])
      setBounds(newBounds)
    }
  }, [route])
  const handlePositionChange = () => {
    setMarkers([
      { position: positionA, key: 'A' },
      { position: positionB, key: 'B' },
    ]);
    setShowPolygon(true);
  };
  const handleSetBounds = (bounds) => {
    setBounds(bounds)
  }
  return (
    <>
      <Flex className="wrapper" justify='space-between'>
        <Flex vertical="vertical">
          <Typography.Title>Position A</Typography.Title>
          <Input placeholder='position (A)'
            value={positionA.lat}
            onChange={(e) => setPositionA({ ...positionA, lat: e.target.value })} />
          <Input placeholder='position (A)'
            value={positionA.lng}
            onChange={(e) => setPositionA({ ...positionA, lng: e.target.value })} />
          <Divider className='divider' />
          <Typography.Title>Position B</Typography.Title>
          <Input placeholder='position (B)'
            value={positionB.lat}
            onChange={(e) => setPositionB({ ...positionB, lat: e.target.value })}
          />
          <Input placeholder='position (B)'

            value={positionB.lng}
            onChange={(e) => setPositionB({ ...positionB, lng: e.target.value })} />
          <Button onClick={handlePositionChange}>Change Position</Button>
        </Flex>
        <div className="map">
          <MapContainer
            style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
            center={mapCenter} zoom={17} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker key={marker.key} position={marker.position}>
                <Popup>
                  {`Position ${marker.key}: ${marker.position.lat}, ${marker.position.lng}`}
                </Popup>
              </Marker>
            ))}
            <AutoFitBound bounds={bounds} handleSetBounds={handleSetBounds} />
            {showPolygon && (
              <Polyline
                positions={points}
                pathOptions={{ color: 'red' }}
              />
            )}
          </MapContainer>
        </div>
      </Flex >
    </>
  )
}

export default App
