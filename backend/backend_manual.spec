# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('main.py','.'),('platform_detector.py', '.'), ('api', 'api'), ('config.py', '.'), ('.env', '.'), ('models', 'models'), ('.venv/Lib/site-packages/onnxruntime_qnn-1.22.0.dist-info','onnxruntime_qnn-1.22.0.dist-info/'),('models--sign--sockeye-text-to-factored-signwriting', 'models--sign--sockeye-text-to-factored-signwriting'),('models_for_build','models')],
    hiddenimports=['fastapi', 'fastapi.middleware.cors', 'fastapi.middleware', 'fastapi.encoders', 'fastapi.dependencies', 'fastapi.security', 'starlette', 'starlette.middleware', 'starlette.middleware.cors', 'sockeye', 'starlette.routing', 'starlette.responses', 'starlette.background', 'starlette.concurrency', 'starlette.datastructures', 'starlette.types', 'uvicorn', 'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.websockets', 'uvicorn.lifespan', 'pydantic', 'typing_extensions', 'python_multipart', 'requests', 'dotenv', 'dotenv.main', 'jinja2', 'anyio', 'h11', 'torch', 'torch._C', 'signwriting_translation', 'signwriting_translation.bin', 'pydantic_core', 'numpy', 'tqdm', 'numba', 'whisper', 'qai_hub', 'qai_hub_models', 'qai_hub_models.models._shared.whisper.app', 'qai_hub_models.utils.onnx_torch_wrapper', 'onnxruntime', 'platform_detector', 'tiktoken_ext.openai_public', 'tiktoken_ext', 'tiktoken'],
    hookspath=['custom_hooks'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    name='backend.exe',
    debug='all',
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='backend'
)