import { CART_ITEMS, GET_RESTAURANTS, SELECT_RESTAURANT, ADD_CART_RESTAURANT } from './actionTypes'
import { loadData, saveData } from '../LocalStorage'

const initState = {
  isLoading: false,
  restaurantData: loadData('restaurantData') || [] ,
  restaurantItems: loadData('restaurantItems') || [],
  cartItems: loadData('cartItems') || [],
  isError: false,
  restaurantName: loadData('restaurantName') || '',
  restaurantId: loadData('restaurantId') || '',
  cartRestaurant: loadData('cartRestaurant') || '',
  cartRestaurantId: loadData('cartRestaurantId') || '',
  totalCartValue: loadData('totalCartValue') || 0,
  totalCartItems: loadData('totalCartItems') || 0
}


const reducer = (state = initState, { type, payload }) => {
  // console.log(type, payload);
  switch (type) {
    case GET_RESTAURANTS.REQUEST:{
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    }

    case GET_RESTAURANTS.SUCCESS:{
      saveData('restaurantData', payload)
      return {
        ...state,
        restaurantData: payload,
        isLoading: false
      };
    }

    case GET_RESTAURANTS.FAILURE:{
      return {
        ...state,
        isError: true,
        isLoading: false
      };
    }

    case SELECT_RESTAURANT: {
      let seletedRestaurant = state.restaurantData.filter(item => item._id === payload._id)[0]
      for(let i = 0; i < seletedRestaurant.foodItems.length; i++){
        for(let j = 0; j < state.cartItems.length; j++){
          if(seletedRestaurant.foodItems[i]._id === state.cartItems[j]._id){
            seletedRestaurant.foodItems[i].quantity = state.cartItems[j].quantity
          }
        }
      }
      saveData('restaurantId', seletedRestaurant._id)
      saveData('restaurantName', seletedRestaurant.restaurentName)
      saveData('restaurantItems', seletedRestaurant.foodItems)
      return{
        ...state,
        restaurantId: seletedRestaurant._id,
        restaurantName: seletedRestaurant.restaurentName,
        restaurantItems: seletedRestaurant.foodItems
      }
    }

    case CART_ITEMS.ADD: {
        let addedItems = state.cartItems.find(item => item._id === payload._id)
        // let restaurantItem = state.restaurantItems.find(item=> item._id === payload._id)
        if(addedItems){
          addedItems.quantity += 1
          saveData('totalCartValue', state.totalCartValue + addedItems.itemPrice)
          saveData('totalCartItems', state.totalCartItems + 1)
          saveData('cartRestaurantId', state.restaurantId)
          saveData('cartRestaurant', state.restaurantName)
          saveData('cartItems', state.cartItems)
          saveData('restaurantItems', state.restaurantItems)
          return {
            ...state,
            totalCartValue: state.totalCartValue + addedItems.itemPrice,
            totalCartItems: state.totalCartItems + 1,
            cartRestaurantId: state.restaurantId,
            cartRestaurant: state.restaurantName,
            cartItems: state.cartItems,
            restaurantItems: state.restaurantItems
          }
        }
        else{
          payload.quantity = 1
          saveData('totalCartValue', state.totalCartValue + payload.itemPrice)
          saveData('totalCartItems', state.totalCartItems + payload.quantity)
          saveData('cartItems', [...state.cartItems, payload])
          saveData('restaurantItems', state.restaurantItems)
          return {
            ...state,
            totalCartItems: state.totalCartItems + payload.quantity,
            totalCartValue: state.totalCartValue + payload.itemPrice,
            cartItems: [...state.cartItems, payload],
            restaurantItems: state.restaurantItems
          }
        }
    }

    case CART_ITEMS.REMOVE: {
      let removeItems = state.cartItems.find(item => item._id === payload)
      let restaurantItem = state.restaurantItems.find(item=> item._id === payload)

      if(removeItems){
        if(removeItems.quantity === 1){
          let newItems = state.cartItems.filter(item => item._id !== payload)
          restaurantItem.quantity = 0

          saveData('totalCartValue', state.totalCartValue - removeItems.itemPrice)
          saveData('totalCartItems', state.totalCartItems - 1)
          saveData('cartItems', newItems)
          saveData('restaurantItems', state.restaurantItems)

          return {
            ...state,
            totalCartValue: state.totalCartValue - removeItems.itemPrice,
            totalCartItems: state.totalCartItems - 1,
            cartItems: newItems,
            restaurantItems: state.restaurantItems
          }
        }
        else{
          removeItems.quantity -= 1

          saveData('totalCartValue', state.totalCartValue - removeItems.itemPrice)
          saveData('totalCartItems', state.totalCartItems - 1)
          saveData('cartItems', state.cartItems)
          saveData('restaurantItems', state.restaurantItems)

          return {
            ...state,
            totalCartValue: state.totalCartValue - removeItems.itemPrice,
            totalCartItems: state.totalCartItems - 1,
            cartItems: state.cartItems,
            restaurantItems: state.restaurantItems
          }
        }
      }
  }
  case ADD_CART_RESTAURANT: {
    saveData('cartRestaurantId', payload.id)
    saveData('cartRestaurant', payload.name)
    return {
      ...state,
      cartRestaurant: payload.name,
      cartRestaurantId: payload.id,
    }
  }
    default:
      return state;
  }
};

export default reducer;