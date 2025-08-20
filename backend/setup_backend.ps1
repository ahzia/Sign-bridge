uv venv .venv -p 3.11.13
.\.venv\Scripts\activate
uv pip install -r requirements_main.txt
uv pip install -r requirements_npu.txt
uv pip uninstall onnxruntime onnxruntime-qnn
uv pip install onnxruntime-qnn==1.22.0
