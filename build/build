#!/usr/bin/php
<?php
	/**
	 * Javascript Build Process
	 *
	 * @author Joe Lambert
	 * @copyright Joe Lambert, 5 May, 2011
	 **/
	
	$xml = simplexml_load_file(dirname(__FILE__)."/build.xml");
	
	$docroot = $xml->docroot ? $xml->docroot : "./";
	
	$version = $xml->version ? $xml->version : "1.0";
	
	// Process each output file
	foreach($xml->output->file as $output)
	{
		$concat = "";
		$attr = $output->attributes();
		
		$outputname = $attr['name'] ? $attr['name']."" : "javascript";

		// Concat javascript files
		foreach($output->source as $file)
			$concat .= file_get_contents(dirname(__FILE__)."/$docroot/$file")."\n\n";

		// Process any replacements
		$concat = str_replace('@VERSION', $version, $concat);

		// Save to disk
		$max_path = dirname(__FILE__)."/$docroot/$outputname.js";
		file_put_contents($max_path, $concat);

		// Compile and minify with Google Closure Compiler
		$min_path = dirname(__FILE__)."/$docroot/$outputname.min.js";

		system("java -jar ".escapeshellarg(dirname(__FILE__)."/google-compiler-20100917.jar")." --js ".escapeshellarg($max_path)." --warning_level QUIET --js_output_file ".escapeshellarg($min_path));
		
		echo $outputname.".js:\n  ".round(strlen(file_get_contents($max_path))/1024, 2)."KB\n  ".round(strlen(gzcompress(file_get_contents($max_path)))/1024, 2)."KB (gzipped)\n\n";
		echo $outputname.".min.js:\n  ".round(strlen(file_get_contents($min_path))/1024, 2)."KB\n  ".round(strlen(gzcompress(file_get_contents($min_path)))/1024, 2)."KB (gzipped)\n\n";
	}
?>