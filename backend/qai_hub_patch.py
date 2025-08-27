"""
Patch for qai_hub_models to handle missing files in production build.
"""
import os
import sys
import logging

logger = logging.getLogger(__name__)

def patch_qai_hub_models():
    """Enhanced patch for qai_hub_models in bundled environment."""
    try:
        # Check if we're running in a PyInstaller bundle
        if getattr(sys, 'frozen', False):
            # We're in a PyInstaller bundle
            bundle_dir = sys._MEIPASS
            logger.info(f"Running in PyInstaller bundle: {bundle_dir}")
            
            # Add the bundle directory to the Python path
            if bundle_dir not in sys.path:
                sys.path.insert(0, bundle_dir)
            
            # Create a patch for qai_hub_models to find files in the bundle
            import qai_hub_models
            
            # Patch the __file__ attribute to point to the bundle location
            original_file = qai_hub_models.__file__
            qai_hub_models.__file__ = os.path.join(bundle_dir, 'qai_hub_models', '__init__.py')
            
            logger.info(f"Patched qai_hub_models.__file__ from {original_file} to {qai_hub_models.__file__}")
            
            # Also patch the module search path
            if hasattr(qai_hub_models, '__path__'):
                qai_hub_models.__path__.insert(0, os.path.join(bundle_dir, 'qai_hub_models'))
                logger.info(f"Added bundle path to qai_hub_models.__path__: {qai_hub_models.__path__}")
            
            # Copy YAML files to correct locations in bundled environment
            yaml_files = ['asset_bases.yaml', 'devices_and_chipsets.yaml']
            for yaml_file in yaml_files:
                # Try multiple possible source locations
                possible_sources = [
                    os.path.join(bundle_dir, yaml_file),
                    os.path.join(bundle_dir, 'qai_hub_models', yaml_file),
                    os.path.join(bundle_dir, 'temp_src', 'qai_hub_models', yaml_file),
                    os.path.join(bundle_dir, 'backend', yaml_file)  # Also check backend directory
                ]
                
                target = os.path.join(bundle_dir, 'qai_hub_models', yaml_file)
                
                # Check if target already exists
                if os.path.exists(target):
                    logger.info(f"✅ {yaml_file} already exists at {target}")
                    continue
                
                # Try to copy from one of the possible sources
                copied = False
                for source in possible_sources:
                    if os.path.exists(source):
                        import shutil
                        shutil.copy2(source, target)
                        logger.info(f"✅ Copied {yaml_file} from {source} to {target}")
                        copied = True
                        break
                
                if not copied:
                    logger.warning(f"⚠️ Could not find {yaml_file} in any expected location")
                    # Try to create a minimal version if not found
                    if yaml_file == 'asset_bases.yaml':
                        minimal_content = """store_url: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models
web_asset_folder: models/{model_id}/web-assets
static_web_banner_filename: model_demo.png
animated_web_banner_filename: model_demo.mp4
model_asset_folder: models/{model_id}/v{version}
dataset_asset_folder: datasets/{dataset_id}/v{version}
repo_url: https://github.com/quic/ai-hub-models/blob/main
qaihm_repo: qai_hub_models/models/{model_id}
labels_path: qai_hub_models/labels/{labels_file}
example_use: qai_hub_models/models/{model_id}#example--usage
huggingface_path: qualcomm/{model_name}
models_website_url: https://aihub.qualcomm.com
models_website_relative_path: models/{model_id}
email_template: qai_hub_models/scripts/templates/email_template.txt
genie_url: https://github.com/quic/ai-hub-apps/tree/main/tutorials/llm_on_genie"""
                        with open(target, 'w') as f:
                            f.write(minimal_content)
                        logger.info(f"✅ Created minimal {yaml_file} at {target}")
                    elif yaml_file == 'devices_and_chipsets.yaml':
                        minimal_content = """# Minimal devices_and_chipsets.yaml for bundled environment
# This is a fallback version when the full file is not available
devices:
  default:
    chipsets: [default]
chipsets:
  default:
    name: "Default Chipset"
    description: "Default chipset for bundled environment"
"""
                        with open(target, 'w') as f:
                            f.write(minimal_content)
                        logger.info(f"✅ Created minimal {yaml_file} at {target}")
        
        logger.info("✅ qai_hub_models patch applied successfully")
        
    except Exception as e:
        logger.warning(f"⚠️ Failed to patch qai_hub_models: {e}")

def ensure_yaml_files_exist():
    """Ensure that required YAML files exist in the expected locations."""
    try:
        import qai_hub_models
        qai_dir = os.path.dirname(qai_hub_models.__file__)
        
        # Check for asset_bases.yaml
        asset_bases_path = os.path.join(qai_dir, 'asset_bases.yaml')
        if not os.path.exists(asset_bases_path):
            # Try to copy from current directory
            current_asset_bases = 'asset_bases.yaml'
            if os.path.exists(current_asset_bases):
                import shutil
                shutil.copy2(current_asset_bases, asset_bases_path)
                logger.info(f"✅ Copied asset_bases.yaml to {asset_bases_path}")
            else:
                logger.warning(f"⚠️ asset_bases.yaml not found in {asset_bases_path} or current directory")
        
        # Check for devices_and_chipsets.yaml
        devices_path = os.path.join(qai_dir, 'devices_and_chipsets.yaml')
        if not os.path.exists(devices_path):
            # Try to copy from current directory
            current_devices = 'devices_and_chipsets.yaml'
            if os.path.exists(current_devices):
                import shutil
                shutil.copy2(current_devices, devices_path)
                logger.info(f"✅ Copied devices_and_chipsets.yaml to {devices_path}")
            else:
                logger.warning(f"⚠️ devices_and_chipsets.yaml not found in {devices_path} or current directory")
        
        logger.info("✅ YAML files check completed")
        
    except Exception as e:
        logger.warning(f"⚠️ Failed to ensure YAML files exist: {e}")

def patch_torchscript_modules():
    """Patch TorchScript modules to work in bundled environment."""
    try:
        if getattr(sys, 'frozen', False):
            bundle_dir = sys._MEIPASS
            logger.info(f"Patching TorchScript modules for bundled environment: {bundle_dir}")
            
            # Add temp_src to Python path for source file access
            temp_src_path = os.path.join(bundle_dir, 'temp_src')
            if os.path.exists(temp_src_path) and temp_src_path not in sys.path:
                sys.path.insert(0, temp_src_path)
                logger.info(f"✅ Added temp_src to Python path: {temp_src_path}")
            
            # Patch signwriting_translation module path
            try:
                import signwriting_translation
                # Update module path to point to bundled location
                signwriting_src = os.path.join(bundle_dir, 'temp_src', 'signwriting_translation')
                if os.path.exists(signwriting_src):
                    signwriting_translation.__path__.insert(0, signwriting_src)
                    logger.info(f"✅ Patched signwriting_translation path: {signwriting_src}")
            except ImportError:
                logger.warning("⚠️ signwriting_translation module not found")
            
            # Patch sockeye module path
            try:
                import sockeye
                # Update module path to point to bundled location
                sockeye_src = os.path.join(bundle_dir, 'temp_src', 'sockeye')
                if os.path.exists(sockeye_src):
                    sockeye.__path__.insert(0, sockeye_src)
                    logger.info(f"✅ Patched sockeye path: {sockeye_src}")
            except ImportError:
                logger.warning("⚠️ sockeye module not found")
        
        logger.info("✅ TorchScript modules patch applied successfully")
        
    except Exception as e:
        logger.warning(f"⚠️ Failed to patch TorchScript modules: {e}")

def apply_patches():
    """Apply all patches for production build."""
    patch_qai_hub_models()
    ensure_yaml_files_exist()
    patch_torchscript_modules()

