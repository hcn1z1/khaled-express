// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_printer_status() -> String {
    "Thermal 80mm Code 128 Printer Ready".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_printer_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
