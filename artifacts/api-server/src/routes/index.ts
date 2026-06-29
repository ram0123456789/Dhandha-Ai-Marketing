import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imagesRouter from "./images";
import socialRouter from "./social";
import postsRouter from "./posts";
import businessRouter from "./business";
import competitorsRouter from "./competitors";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imagesRouter);
router.use(socialRouter);
router.use(postsRouter);
router.use(businessRouter);
router.use(competitorsRouter);
router.use(reviewsRouter);

export default router;
