const {check} = require('express-validator')

module.exports = [
    check('username')
    .exists().withMessage('Vui lòng cung cấp tên người dùng')
    .notEmpty().withMessage('Tên người dùng không được để trống'),

    check('password')
    .exists().withMessage('Vui lòng cung cấp mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({min: 6}).withMessage('Mật khẩu phải có tối thiểu 6 kí tự')
]