import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DRONE_SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB'
const DRONE_CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB'

export const useDroneStore = defineStore('drone', () => {
  const isConnected = ref(false)
  const deviceName = ref('')
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const bluetoothDevice = ref<BluetoothDevice | null>(null)
  const controlCharacteristic = ref<BluetoothRemoteGATTCharacteristic | null>(null)

  const leftStick = ref({ x: 50, y: 50 })
  const rightStick = ref({ x: 50, y: 50 })

  const flightMode = ref('Стабилизация')
  const batteryLevel = ref(75)
  const altitude = ref(0)
  const speed = ref(0)
  const roll = ref(0)
  const pitch = ref(0)
  const yaw = ref(0)
  const gpsStatus = ref(true)
  const compassStatus = ref(true)
  const batteryVoltage = ref(11.1)

  const batteryStatus = computed(() => {
    if (batteryVoltage.value >= 11.0) return 'text-green-600'
    if (batteryVoltage.value >= 10.0) return 'text-yellow-600'
    return 'text-red-600'
  })

  async function connectToDevice() {
    try {
      connectionStatus.value = 'connecting'
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [DRONE_SERVICE_UUID, 'battery_service', 'device_information']
      })

      deviceName.value = device.name || 'Неизвестное устройство'
      bluetoothDevice.value = device
      
      const server = await device.gatt?.connect()
      
      if (server) {
        isConnected.value = true
        connectionStatus.value = 'connected'
        
        const droneService = await server.getPrimaryService(DRONE_SERVICE_UUID)
        controlCharacteristic.value = await droneService.getCharacteristic(DRONE_CHARACTERISTIC_UUID)
        
        const batteryService = await server.getPrimaryService('battery_service')
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level')
        
        batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value
          batteryLevel.value = value.getUint8(0)
        })
        
        await batteryCharacteristic.startNotifications()
      }
    } catch (error) {
      console.error('Ошибка подключения:', error)
      connectionStatus.value = 'disconnected'
    }
  }

  function disconnect() {
    if (bluetoothDevice.value?.gatt?.connected) {
      bluetoothDevice.value.gatt.disconnect()
    }
    isConnected.value = false
    connectionStatus.value = 'disconnected'
    deviceName.value = ''
    bluetoothDevice.value = null
    controlCharacteristic.value = null
  }

  async function sendCommand(command: string) {
    if (!controlCharacteristic.value || !isConnected.value) return
    
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(command)
      await controlCharacteristic.value.writeValue(data)
    } catch (error) {
      console.error('Ошибка отправки команды:', error)
    }
  }

  async function updateStickPosition(stick: 'left' | 'right', x: number, y: number) {
    if (stick === 'left') {
      leftStick.value = { x, y }
      await sendCommand(`L${Math.round(x)},${Math.round(y)}`)
    } else {
      rightStick.value = { x, y }
      await sendCommand(`R${Math.round(x)},${Math.round(y)}`)
    }
  }

  async function sendButtonCommand(button: string, state: boolean) {
    await sendCommand(`${button}${state ? '1' : '0'}`)
  }

  return {
    isConnected,
    deviceName,
    connectionStatus,
    leftStick,
    rightStick,
    flightMode,
    batteryLevel,
    altitude,
    speed,
    roll,
    pitch,
    yaw,
    gpsStatus,
    compassStatus,
    batteryVoltage,
    batteryStatus,
    connectToDevice,
    disconnect,
    updateStickPosition,
    sendButtonCommand
  }
}) 