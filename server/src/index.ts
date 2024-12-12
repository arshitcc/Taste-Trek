import connectDB from './db'
import { app } from './app'
import { PORT } from './utils/env'


connectDB()
.then(() => {
    app.listen(PORT || 6900, () => {  
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((error) => {
    console.log(`MongoDB Connection Failed !!`, error);
})