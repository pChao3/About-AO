import { login, pettion } from '@/scripts/login';
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { key, methodName, name } = req.body;

    try {
      const fun = methodName === 'login' ? login : pettion;
      const result = await fun(key, name);
      console.log(result);
      return res.status(200).json({ message: '执行成功', data: result });
    } catch (error) {
      console.error(`执行错误: ${error.message}`);
      return res.status(500).json({ message: '执行错误', error: error.message });
    }
  } else {
    res.status(405).json({ message: '仅支持 POST 请求' });
  }
}
