const express = require('express');
const router = express.Router();
const authz = require('../middlewares/authorization');

const titleController = require('../app/controllers/title.controller');

router.post('/create', authz.verifyAdmin, titleController.createTitle);
router.post('/update', authz.verifyAdmin, titleController.updateTitle);
router.get('/delete', authz.verifyAdmin, titleController.deleteTitle);
router.get('/detail/:slug', titleController.getTitle);
router.get('/', titleController.getAllTitles);

module.exports = router;