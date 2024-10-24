export const fetchAO = async params => {
  const response = await fetch('/api/run-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params), // 将数据发送到后端
  });
  return await response.json();
};
