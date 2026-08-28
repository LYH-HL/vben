export default {
            name: 'Login',
    data() {
        return {     
            loading: false,
            loginForm: {
                username: '',
                password: '' 
            },
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],                
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        login() {
            this.$refs.loginForm.validate((valid) => {
                if (!valid) return;
                this.loading = true;
            });
        }
    }
};
axios.post('/api/login', this.loginForm)
    .then