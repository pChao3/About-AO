import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { key, methodName, name } = req.body; // 从请求中获取 localStorage 数据

    // 检查 key 是否有效
    if (!key) {
      return res.status(400).json({ message: '缺少有效的 key' });
    }

    // 获取脚本的完整路径
    const scriptPath = path.resolve('src/scripts/login.js');
    const command = `node "${scriptPath}" '${JSON.stringify(key)}' "${methodName}" "${name}"`;

    // console.log(key.kty, typeof key);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行错误: ${error.message}`);
        return res.status(500).json({ message: '执行错误', error: error.message });
      }
      if (stderr) {
        console.error(`错误输出: ${stderr}`);
        return res.status(500).json({ message: '运行出错', stderr });
      }

      console.log(`脚本输出: ${stdout}`);
      return res.status(200).json({ message: '执行成功', data: stdout });
    });
  } else {
    res.status(405).json({ message: '仅支持 POST 请求' });
  }
}
