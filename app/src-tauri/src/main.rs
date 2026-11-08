// G-vis som program: samma sidor som på webben, lokalt och utan internet.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("G-vis kunde inte starta");
}
