import React from 'react'

function Unauthorized() {
  return (
    <div>
        <h1 className='text-3xl font-bold text-red-600'>Access Denied 🚫</h1>
        <p className='mt-2 text-gray-100'>You cannot access this page</p>
    </div>
  )
}

export default Unauthorized