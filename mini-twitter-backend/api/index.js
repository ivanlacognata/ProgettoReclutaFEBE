import express from 'express';
import authRouter from './auth.js';
import postsRouter from './posts.js';
import commentsRouter from './comments.js';
import likesRouter from './likes.js';
import usersRouter from './users.js';
import healthRouter from './health.js';

const router = express.Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/likes', likesRouter);

export default router;
