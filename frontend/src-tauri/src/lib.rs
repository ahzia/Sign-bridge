use tauri::Manager;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

struct BackendState(Arc<Mutex<Option<std::process::Child>>>);

#[tauri::command]
async fn start_backend(state: tauri::State<'_, BackendState>) -> Result<(), String> {
    let mut guard = state.0.lock().unwrap();
    
    if guard.is_some() {
        return Ok(()); // Already running
    }
    
    // Get the app directory
    let app_dir = std::env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?
        .parent()
        .ok_or("Failed to get app directory")?
        .to_path_buf();
    
    // Path to the bundled Python backend
    let backend_path = app_dir.join("resources").join("backend");
    
    // Start the backend process
    let child = Command::new(backend_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start backend: {}", e))?;
    
    *guard = Some(child);
    Ok(())
}

#[tauri::command]
async fn stop_backend(state: tauri::State<'_, BackendState>) -> Result<(), String> {
    let mut guard = state.0.lock().unwrap();
    
    if let Some(mut child) = guard.take() {
        child.kill().map_err(|e| format!("Failed to stop backend: {}", e))?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(BackendState(Arc::new(Mutex::new(None))))
    .invoke_handler(tauri::generate_handler![start_backend, stop_backend])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Start backend automatically
      let _state = app.state::<BackendState>();
      
      thread::spawn(move || {
        // Wait a moment for the app to fully start
        thread::sleep(std::time::Duration::from_millis(1000));
        
        // Start the backend process
        let app_dir = std::env::current_exe()
            .unwrap_or_else(|_| std::env::current_dir().unwrap())
            .parent()
            .unwrap_or(&std::env::current_dir().unwrap())
            .to_path_buf();
        
        let backend_path = app_dir.join("resources").join("backend");
        
        if backend_path.exists() {
            match Command::new(&backend_path)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn() {
                Ok(mut child) => {
                    // Wait for the backend to start and check if it's still running
                    thread::sleep(std::time::Duration::from_millis(2000));
                    
                    match child.try_wait() {
                        Ok(Some(status)) => {
                            eprintln!("Backend process exited with status: {:?}", status);
                        }
                        Ok(None) => {
                            // Backend is still running, monitor it
                            thread::spawn(move || {
                                let _ = child.wait();
                                eprintln!("Backend process has stopped");
                            });
                        }
                        Err(e) => {
                            eprintln!("Error checking backend process: {}", e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to start backend: {}", e);
                }
            }
        } else {
            eprintln!("Backend executable not found at: {:?}", backend_path);
        }
      });
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
