from PyInstaller.utils.hooks import collect_data_files

# excludedimports = ["g", "gevent.tests"]

datas = collect_data_files(
    'qai_hub_models',
)
