import { Router, type IRouter } from "express";
import healthRouter from "./health";
import alarmsRouter from "./alarms";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(alarmsRouter);

export default router;
