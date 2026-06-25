const express = require('express');
const { getMembers, createMember, updateMember, deleteMember } = require('../controllers/memberController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMembers);
router.post('/create', createMember);
router.patch('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
