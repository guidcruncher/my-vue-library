import { ref } from 'vue'

export function useIndexedDB(dbName: string, storeName: string) {
  const db = ref<IDBDatabase | null>(null)

  const init = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1)

      request.onupgradeneeded = (event: any) => {
        const database = event.target.result
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
        }
      }

      request.onsuccess = (event: any) => {
        db.value = event.target.result
        resolve()
      }

      request.onerror = (event) => reject(event)
    })
  }

  const put = async (item: any): Promise<IDBValidKey> => {
    if (!db.value) await init()
    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const get = async (id: IDBValidKey): Promise<any> => {
    if (!db.value) await init()
    return new Promise((resolve, reject) => {
      const transaction = db.value!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return { put, get }
}
