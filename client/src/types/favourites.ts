export interface IFavourites {
    userId : string,
    orderId : string
}

export interface IFavouritesState {
    isLoading : boolean,
    favourites : IFavourites[],
    
    addToFavourites : (orderId : string) => Promise<void>,
    removeFromFavourites : (orderId : string) =>  Promise<void>,
    getFavourites : () => Promise<void>
}