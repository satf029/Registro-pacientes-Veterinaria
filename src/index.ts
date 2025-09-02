import express from "express";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import propietarioRoutes from "./routes/propietario.route";


const app = express();


app.use(express.json());
app.use(logger);
app.use('/api', propietarioRoutes);
app.use(errorHandler);



app.listen(3000, ()=>{
    console.log('Servidor');
}
)