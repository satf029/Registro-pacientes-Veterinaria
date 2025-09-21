import express from "express";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import propietarioRoutes from "./routes/propietario.route";
import loginRoute from "./routes/login.routes";
import userRoute from "./routes/user.routes";
import medicamentoRoute from "./routes/medicamentos.routes";
import weatherRoutes from "./routes/weather.routes";
import cors from "cors";
import path from 'path';
import serviceRoute from "./routes/servicio.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/api', loginRoute);
app.use('/api', propietarioRoutes);
app.use('/api',userRoute);
app.use('/api',medicamentoRoute);
app.use('/api', weatherRoutes);
app.use('/api',serviceRoute);
app.use(errorHandler);


app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
/*
app.listen(3000, ()=>{
    console.log('Servidor');
}
)*/