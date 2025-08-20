using System.Text.Json;

Console.WriteLine("QuartzScheduler Test Project Starting..."); 

try
{ 
    var filePath = "C:\\temp\\AppRunner.txt";
    var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    var executionId = Guid.NewGuid().ToString("N")[..8];
    
    Console.WriteLine($"Target file path: {filePath}");
    Console.WriteLine($"Current timestamp: {timestamp}");
    Console.WriteLine($"Execution ID: {executionId}");
    Console.WriteLine($"Command line arguments count: {args.Length}");
    Console.WriteLine();
    
    // Process and serialize arguments
    var argumentsData = ProcessArguments(args);
    
    // Create directory if needed (same as FileWriterJob)
    var directory = Path.GetDirectoryName(filePath);
    if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
    {
        Directory.CreateDirectory(directory);
        Console.WriteLine($"Created directory: {directory}");
    }
    
    // Build content using the same format as FileWriterJob
    var content = BuildFileContent(timestamp, executionId, argumentsData);
    
    Console.WriteLine("Writing content to file...");
    
    // Write to file (same as FileWriterJob)
    await File.WriteAllTextAsync(filePath, content);
    
    // Verify file was created
    if (File.Exists(filePath))
    {
        var fileInfo = new FileInfo(filePath);
        Console.WriteLine($"SUCCESS: File created successfully!");
        Console.WriteLine($"File path: {filePath}");
        Console.WriteLine($"File size: {fileInfo.Length} bytes");
        Console.WriteLine($"File modified: {fileInfo.LastWriteTime}");
    }
    else
    {
        Console.WriteLine($"ERROR: File was not created at {filePath}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR: Failed to write file: {ex.Message}");
    Console.WriteLine($"Exception type: {ex.GetType().Name}");
} 

static ArgumentsData ProcessArguments(string[] args)
{
    var argumentsData = new ArgumentsData
    {
        Count = args.Length,
        Arguments = new List<ArgumentInfo>(),
        RawArguments = args.ToList(),
        SerializedJson = JsonSerializer.Serialize(args, new JsonSerializerOptions { WriteIndented = true }),
        ProcessedAt = DateTime.Now
    };
    
    // Process each argument
    for (int i = 0; i < args.Length; i++)
    {
        var argInfo = new ArgumentInfo
        {
            Index = i,
            Value = args[i],
            Length = args[i].Length,
            Type = DetermineArgumentType(args[i]),
            IsEmpty = string.IsNullOrWhiteSpace(args[i])
        };
        
        argumentsData.Arguments.Add(argInfo);
        
        // Display argument info
        Console.WriteLine($"Argument {i}: '{args[i]}' (Type: {argInfo.Type}, Length: {argInfo.Length})");
    }
    
    return argumentsData;
}

static string DetermineArgumentType(string arg)
{
    if (string.IsNullOrWhiteSpace(arg)) return "Empty";
    if (int.TryParse(arg, out _)) return "Integer";
    if (double.TryParse(arg, out _)) return "Number";
    if (bool.TryParse(arg, out _)) return "Boolean";
    if (arg.StartsWith("-") || arg.StartsWith("/")) return "Flag";
    if (arg.Contains("=")) return "KeyValue";
    if (Path.IsPathRooted(arg)) return "Path";
    return "String";
}

static string BuildFileContent(string timestamp, string executionId, ArgumentsData argumentsData)
{
    var content = new System.Text.StringBuilder();
    
    content.AppendLine("=====================================");
    content.AppendLine("    QUARTZ TEST PROJECT EXECUTION");
    content.AppendLine("=====================================");
    content.AppendLine($"Execution Time: {timestamp}");
    content.AppendLine($"Job Name: QuartzScheduler.Tests.exe");
    content.AppendLine($"Execution ID: {executionId}");
    content.AppendLine();

    content.AppendLine("--- COMMAND LINE ARGUMENTS ---");
    content.AppendLine($"Total arguments: {argumentsData.Count}");
    content.AppendLine($"Processed at: {argumentsData.ProcessedAt:yyyy-MM-dd HH:mm:ss}");
    content.AppendLine();
    
    if (argumentsData.Count > 0)
    {
        // Individual arguments
        content.AppendLine("--- ARGUMENT DETAILS ---");
        foreach (var arg in argumentsData.Arguments)
        {
            content.AppendLine($"Index: {arg.Index}");
            content.AppendLine($"Value: {arg.Value}");
            content.AppendLine($"Type: {arg.Type}");
            content.AppendLine($"Length: {arg.Length}");
            content.AppendLine($"Is Empty: {arg.IsEmpty}");
            content.AppendLine();
        }
        
        // JSON Serialization
        content.AppendLine("--- SERIALIZED JSON ---");
        content.AppendLine(argumentsData.SerializedJson);
        content.AppendLine();
        
        // Raw arguments list
        content.AppendLine("--- RAW ARGUMENTS ---");
        for (int i = 0; i < argumentsData.RawArguments.Count; i++)
        {
            content.AppendLine($"args[{i}] = \"{argumentsData.RawArguments[i]}\"");
        }
        content.AppendLine();
    }
    else
    {
        content.AppendLine("No command line arguments provided.");
        content.AppendLine();
    }
    
    // Footer (same format as FileWriterJob)
    content.AppendLine("--- END OF EXECUTION ---");
    content.AppendLine($"File generated at: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
    content.AppendLine("=====================================");
    
    return content.ToString();
}

public class ArgumentsData
{
    public int Count { get; set; }
    public List<ArgumentInfo> Arguments { get; set; } = new();
    public List<string> RawArguments { get; set; } = new();
    public string SerializedJson { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}

public class ArgumentInfo
{
    public int Index { get; set; }
    public string Value { get; set; } = string.Empty;
    public int Length { get; set; }
    public string Type { get; set; } = string.Empty;
    public bool IsEmpty { get; set; }
}
