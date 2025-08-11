import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/user/:userId').get(commentController.getUserAllVideoComments);
router.route('/:videoId')
  .get(commentController.getVideoComments)
  .post(commentController.addComment);
router.route('/:commentId')
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
