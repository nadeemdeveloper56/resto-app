
"use client"
import AddFoodItem from '@/app/_components/AddFoodItem'
import FoodItemList from '@/app/_components/FoodItemList'
import RestaurantHeader from '@/app/_components/Restaurantheader'
import React, { useState } from 'react'



export default function DashBoard() {
  const [addItem,setaddItem]=useState(false)

  return (
    <div>
      
        <RestaurantHeader />
        <button onClick={() => setaddItem(true)}>Add Food</button>
        <button onClick={() => setaddItem(false)}>DashBoard</button>
        {
          addItem ? <AddFoodItem AddFoodItem setAddItem={setaddItem}  /> : <FoodItemList/>
        }
        
    </div>
  )
}

